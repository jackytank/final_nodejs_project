import { Request, Response } from "express";
import _ from "lodash";
import * as csv from 'csv-parse';
import validator from "validator";
import { _1MB } from "../../../constants";
import { CustomDataTableResult, CustomDivisionData, CustomEntityApiResult, CustomUserData, CustomValidateResult } from "../../../customTypings/express";
import { AppDataSource } from "../../../DataSource";
import { Division } from "../../../entities/division.entity";
import { DivisionService } from "../../../services/division/division.service";
import { bench, isAllElementDup } from "../../../utils/common";
import { validate, ValidationError } from "class-validator";

class DivisionApiController {
    private divRepo = AppDataSource.getRepository(Division);
    private divService = new DivisionService();

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.search = this.search.bind(this);
        this.importCsv = this.importCsv.bind(this);
    }

    async getAll(req: Request, res: Response) {
        const data = await this.divRepo.createQueryBuilder('d')
            .where('d.deleted_date IS NULL')
            .orderBy('d.name', 'ASC')
            .getMany();
        return res.status(200).json({ data: data });
    }

    async search(req: Request, res: Response) {
        try {
            // save req.query to session for export csv based on search query
            req.session.searchQuery = req.query;
            let result: CustomDataTableResult = { draw: 0, data: [], recordsFiltered: 0, recordsTotal: 0 };
            result = await this.divService.searchData(req.query);
            if (isAllElementDup(result.data)) {
                result.data = _.orderBy(result.data.map((user: CustomUserData) => {
                    return { ...user, "ID": parseInt(user['ID'] as string) };
                }), ['ID'], ['asc']);
            }
            return res.status(200).json(result);
            // data = await this.divService.searchData(req.query);
            // return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: error.message, status: 500 });
        }
    }

    async importCsv(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const msgObj: CustomEntityApiResult<Division> = { messages: [], status: 500 };
        try {
            if (req.file == undefined || req.file.mimetype !== 'text/csv') {
                return res.status(400).json({ message: 'Please upload a CSV file' });
            }
            if (req.file.size > (_1MB * 2)) {
                return res.status(400).json({ message: 'File size cannot be larger than 2MB' });
            }
            const parser = csv.parse({
                delimiter: ',', // phân cách giữa các cell trong mỗi row
                trim: true, // bỏ các khoảng trắng ở đầu và cuối của mỗi cell
                skip_empty_lines: true, // bỏ qua các dòng trống
                columns: true, // gán header cho từng column trong row
            });
            const records: unknown[] = await this.divService.readCsvData(req.file.path, parser);
            if (records.length === 0) {
                return res.status(400).json({ message: 'File is empty' });
            }
            const idRecords = records.filter((record: CustomDivisionData) => record['id'] !== '').map((record: CustomDivisionData) => record['id']);
            const deleteArr: Division[] = []; // array of users to delete
            const insertArr: Division[] = []; // array of users to insert
            const updateArr: Division[] = []; // array of users to update
            // query data from db first then pass it around to prevent multiple query to db, only select id,username,email for performance reason
            const builder = this.divRepo.createQueryBuilder('d').select(['d.id', 'd.email']);
            if (idRecords.length > 0) {
                builder.orWhere('d.id IN (:ids)', { ids: idRecords });
            }
            const dbData = await builder.getMany();
            const { start, end } = bench();
            start();
            const startValidateFunc = async () => {
                // iterate csv records data and check row
                for (let i = 0; i < records.length; i++) {
                    const row: CustomDivisionData = records[i] as CustomDivisionData;
                    const div: Division = Object.assign(new Division(), {
                        id: row['id'] === '' ? null : _.isString(row['id']) ? parseInt(row['id']) : row['id'],
                        name: row['name'] === '' ? null : row['name'],
                        note: row['note'] === '' ? null : row['note'],
                    });
                    // validate entity User imperatively using 'class-validator'
                    const errors: ValidationError[] = await validate(div);
                    if (errors.length > 0) {
                        const errMsgStr = errors.map(error => Object.values(error.constraints as { [type: string]: string; })).join(', ');
                        msgObj.messages?.push(`Row ${i + 1} : ${errMsgStr}`);
                        continue;
                    }
                    console.log('Reading csv row: ', i);
                    // + Trường hợp id rỗng => thêm mới user
                    if (_.isNil(row['id']) || row['id'] === '') {
                        if (row['Delete'] === 'y') {
                            // deleted="y" và colum id không có nhập thì không làm gì hết, ngược lại sẽ xóa row theo id tương ứng dưới DB trong bảng user
                            continue;
                        }
                        div.created_date = new Date();
                        div.updated_date = new Date();
                        dbData.push(div); // push to dbData to check unique later
                        insertArr.push(div); // push to map to insert later
                    } else {
                        // Trường hợp id có trong db (chứ ko phải trong transaction) => chỉnh sửa user nếu deleted != 'y'
                        const findUser = _.find(dbData, { id: div.id });
                        if (findUser) {
                            if (row['Delete'] === 'y') {
                                dbData.splice(dbData.indexOf(findUser), 1); // remove from dbData to check unique later
                                deleteArr.push(findUser); // push to map to delete later
                            } else {
                                div.updated_date = new Date();
                                updateArr.push(div); // push to map to update later
                            }
                        } else {
                            // Trường hợp id không có trong db => hiển thị lỗi "id not exist"
                            msgObj.messages?.push(`Row ${i + 1} : Id not exist`);
                        }
                    }
                }
            };
            // wait for startValidateFunc to finish
            await Promise.all([startValidateFunc()]);

            // delete, update, insert - START
            await Promise.all(
                deleteArr.map(async div => { await queryRunner.manager.remove<Division>(div); }),
            );
            await Promise.all(
                updateArr.map(async div => { await this.divService.updateData(div, dbData, queryRunner); }),
            );
            await Promise.all(
                insertArr.map(async div => { await this.divService.insertData(div, dbData, queryRunner); }),
            );
            // delete, update, insert - END

            // check if msgObj is not empty => meaning has errors => return 500
            if (msgObj?.messages && msgObj.messages?.length > 0) {
                end();
                msgObj.status = 400;
                await queryRunner.rollbackTransaction();
                return res.status(msgObj.status ?? 500).json({ messages: msgObj.messages, status: msgObj.status });
            } else {
                end();
                await queryRunner.commitTransaction();
                return res.status(200).json({ message: 'Import csv file successfully!', status: 200, data: records });
            }
        } catch (error) {
            return res.status(500).json({ messages: ['Internal Server Error'], status: 500 });
        } finally {
            await queryRunner.release();
        }
    }
}

export default new DivisionApiController();