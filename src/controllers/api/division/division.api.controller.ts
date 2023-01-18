import { messages } from './../../../constants';
import { Request, Response } from "express";
import _ from "lodash";
import * as csv from 'csv-parse';
import * as fs from 'fs';
import validator from "validator";
import { _1MB } from "../../../constants";
import { CustomDataTableResult, CustomDivisionData, CustomEntityApiResult, CustomUserData, CustomValidateResult } from "../../../customTypings/express";
import { AppDataSource } from "../../../DataSource";
import { Division } from "../../../entities/division.entity";
import { DivisionService } from "../../../services/division/division.service";
import { bench, isAllElementDup } from "../../../utils/common";
import { validate, ValidationError } from "class-validator";
import logger from '../../../winston';

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
        const newData = data.map((div: Division) => {
            return {
                "id": div.id,
                "name": div.name
            };
        });
        return res.status(200).json({ data: newData });
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
                fs.unlink(req.file?.path as string, err => {
                    if (err) { logger.error(err.message); }
                });
                return res.status(400).json({ message: messages.ECL033('CSV') });
            }
            if (req.file.size > (_1MB * 2)) {
                fs.unlink(req.file?.path as string, err => {
                    if (err) { logger.error(err.message); }
                });
                return res.status(400).json({ message: messages.ECL034('2 MB') });
            }
            const parser = csv.parse({
                delimiter: ',', // phân cách giữa các cell trong mỗi row
                trim: true, // bỏ các khoảng trắng ở đầu và cuối của mỗi cell
                skip_empty_lines: true, // bỏ qua các dòng trống
                columns: true, // gán header cho từng column trong row
            });
            const csvResult = await this.divService.readCsvData(req.file.path, parser);
            if (csvResult.status === 500) {
                return res.status(csvResult.status).json({ message: messages.ECL095 });
            }
            if (csvResult.data.length === 0) {
                return res.status(400).json({ message: messages.ECL095 });
            }
            const divIdRecords = csvResult.data.filter((record: CustomDivisionData) => record['ID'] !== '').map((record: CustomDivisionData) => record['ID']);
            const leaderIdRecords = csvResult.data.filter((record: CustomDivisionData) => record['Division Leader'] !== '').map((record: CustomDivisionData) => record['Division Leader']);
            const deleteArr: Division[] = []; // array of divisions to delete
            const insertArr: Division[] = []; // array of divisions to insert
            const updateArr: Division[] = []; // array of divisions to update
            // query data from db first then pass it around to prevent multiple query to db and using await in loop, only select few columns for performance reason
            const builder = this.divRepo.createQueryBuilder('d').select(['d.id as `Div ID`', 'u.id as `User ID`'])
                .innerJoin('user', 'u');
            if (divIdRecords.length > 0) {
                builder.orWhere('d.id IN (:ids)', { ids: divIdRecords });
            }
            if (leaderIdRecords.length > 0) {
                builder.orWhere('u.id IN (:userIds)', { userIds: leaderIdRecords });
            }
            const dbData = await builder.getRawMany();
            let isValid = true;
            const { start, end } = bench();
            start();
            const startValidateFunc = async () => {
                // iterate csv records data and check row
                for (let i = 0; i < csvResult.data.length; i++) {
                    const row: CustomDivisionData = csvResult.data[i] as CustomDivisionData;
                    const div: Division = Object.assign(new Division(), {
                        id: row['ID'] === '' ? null : _.isString(row['ID']) ? parseInt(row['ID']) : row['ID'],
                        name: row['Division Name'] || null,
                        note: row['Division Note'] || null,
                        division_leader_id: row['Division Leader'] || null,
                        division_floor_num: row['Floor Number'] || null
                    });
                    // validate Division imperatively using 'class-validator', all of Validator in division entity do not query in db don't worry about await in this for loop
                    const checkIsValid = async () => {
                        const errors = await validate(div, { stopAtFirstError: true });
                        if (errors.length > 0) {
                            const errMsgStr = errors.map(error => Object.values(error.constraints as { [type: string]: string; })).join(', ');
                            msgObj.messages?.push(`Dòng: ${i + 1} ${errMsgStr}`);
                            isValid = false;
                        }
                        if (errors.length === 0) {
                            if (!dbData.some((data) => data['User ID'] === row['Division Leader'])) {
                                msgObj.messages?.push(`Dòng: ${i + 1} ${messages.ECL094('Division Leader')}`);
                                isValid = false;
                            }
                        }
                    };
                    console.log('Reading csv row: ', i);

                    // case: Division Leader not exist in db, table user.id
                    // check if 'Division Leader' in CSV exist in db (table user.id) cuz there're no foreign key constraint => check manually

                    // Case: empty or null id? => insert division
                    if (_.isNil(row['ID']) || row['ID'] === '') {
                        await checkIsValid();
                        div.created_date = new Date();
                        div.updated_date = new Date();
                        insertArr.push(div); // push to map to insert later
                    } else {
                        // Case: Division Id exist in db (not in transaction) and 'Delete' !== 'Y'
                        const findUser = _.find(dbData, { "Div ID": row['ID'] });
                        if (findUser) {
                            if (row['Delete'] === 'Y') {
                                // dbData.splice(dbData.indexOf(findUser), 1); // remove from dbData to check unique later
                                deleteArr.push(div); // push to map to delete later
                            } else {
                                await checkIsValid();
                                // dbData.splice(dbData.indexOf(div as Division), 1, div as Division);
                                div.updated_date = new Date();
                                updateArr.push(div); // push to map to update later
                            }
                        } else {
                            // Case: division id not exist in db
                            isValid = false;
                            // if (!isValid) continue;
                            msgObj.messages?.push(`Dòng: ${i + 1} ID${messages.ECL050}`);
                        }
                    }
                }
            };
            // wait for startValidateFunc to finish
            await Promise.all([startValidateFunc()]);

            // delete, update, insert - START
            await Promise.all(
                // remove<Division>(div); 
                deleteArr.map(async div => {
                    const shit = await queryRunner.manager.softDelete(Division, { id: div.id });
                }),
            );
            await Promise.all(
                updateArr.map(async div => { await this.divService.updateData(div, dbData, queryRunner); }),
            );
            await Promise.all(
                insertArr.map(async div => { await this.divService.insertData(div, dbData, queryRunner); }),
            );
            // delete, update, insert - END

            // check if msgObj is not empty => meaning has errors => return BadRequest 400
            if (!isValid) {
                end();
                msgObj.status = 400;
                await queryRunner.rollbackTransaction();
                return res.status(msgObj.status).json({ messages: msgObj.messages, status: msgObj.status });
            } else {
                end();
                await queryRunner.commitTransaction();
                return res.status(200).json({ message: messages.ECL092, status: 200, data: csvResult.data });
            }
        } catch (error) {
            return res.status(500).json({ message: messages.ECL098, status: 500 });
        } finally {
            await queryRunner.release();
        }
    }
}

export default new DivisionApiController();