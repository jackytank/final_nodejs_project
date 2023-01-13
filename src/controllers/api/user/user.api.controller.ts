import { messages, POS_NAME } from '../../../constants';
import { CustomDataTableResult, CustomUserData } from '../../../customTypings/express/index';
import { Request, Response } from 'express';
import _ from 'lodash';
import * as csv from 'csv-parse';
import { SelectQueryBuilder, } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { stringify } from 'csv-stringify';
import validator from 'validator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { UserService } from '../../../services/user/user.service';
import { CustomEntityApiResult, CustomValidateResult, } from '../../../customTypings/express';
import { User } from '../../../entities/user.entity';
import { bench, getRandomPassword, isAllElementDup, isHasDup, isValidDate } from '../../../utils/common';
import { UserModel } from '../../../models/user.model';
import { AppDataSource } from '../../../DataSource';
import { _1MB } from '../../../constants';

dayjs.extend(utc);

class UserApiController {
    private userRepo = AppDataSource.getRepository(User);
    private userService = new UserService();

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.search = this.search.bind(this);
        this.getOne = this.getOne.bind(this);
        this.save = this.save.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
        this.importCsv = this.importCsv.bind(this);
        this.exportCsv = this.exportCsv.bind(this);
    }

    //for routing control purposes - START
    async getAll(req: Request, res: Response) {
        const { take, limit, companyId, companyName } = req.query;
        const result: CustomEntityApiResult<User> = await this.userService.getAllData(take as string, limit as string);
        if (companyId || companyName) {
            // result = await this.userService.getAllDataWithExtraPersonalInfo(req.query);
        } else {
        }
        // result = 
        return res.status(result.status as number).json(result);
    }
    async search(req: Request, res: Response) {
        try {
            // save req.query to session for export csv based on search query
            const { draw } = req.query;
            req.session.searchQuery = req.query;
            let result: CustomDataTableResult = { draw: 0, data: [], recordsFiltered: 0, recordsTotal: 0 };
            if (parseInt(draw as string) !== 1) {
                result = await this.userService.searchData({ ...req.query, name: validator.escape(req.query.name as string) });
                if (isHasDup(result.data)) {
                    result.data = await this.sortAscWith2PointerBy(result.data as CustomUserData[]);
                    // result.data = _.orderBy(result.data.map((user: CustomUserData) => {
                    //     return { ...user, "ID": parseInt(user['ID'] as string) };
                    // }), ['ID'], ['asc']);
                    // (result.data as CustomUserData[]).forEach((u) => {
                    //     console.log(u['ID'], u['Entered Date'], u['Created Date']);
                    //     // console.log(u['Created Date']);
                    //     // console.log(u['Updated Date']);
                    // });
                }
                return res.status(200).json(result);
            }
            return res.status(200).json({});
            // data = await this.userService.searchData(req.query);
            // return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: messages.ECL098, status: 500 });
        }
    }

    async sortAscWith2PointerBy(arr: CustomUserData[]) {
        const tmpArr = arr;
        const lgth = arr.length;
        for (let i = 0; i < lgth - 1; i++) {
            for (let j = i + 1; j < lgth; j++) {
                if ((tmpArr[i]['User Name']) === tmpArr[j]['User Name']) {
                    if (parseInt(tmpArr[i]['ID'] as string) > parseInt(tmpArr[j]['ID'] as string)) {
                        [tmpArr[i], tmpArr[j]] = [tmpArr[j], tmpArr[i]];
                    }
                }
            }
        }
        return tmpArr;
    }

    async getOne(req: Request, res: Response) {
        const result = await this.userService.getOneData(parseInt(req.params.id));
        return res.status(result.status as number).json(result);
    }
    async save(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, entered_date, password, email, position_id, division_id } = req.body;
        const user: User = Object.assign(new User(), {
            name, entered_date, password, email, position_id, division_id
        });
        try {
            const result: CustomEntityApiResult<User> = await this.userService.insertData(user, null, queryRunner, { checkUniqueMail: true, isPasswordHash: true });
            if (result.status !== 200) {
                return res.status(result.status as number).json({ status: result.status, message: result.message ?? messages.ECL093 });
            }
            await queryRunner.commitTransaction();
            return res.status(200).json({ status: 200, message: result.message ?? messages.ECL096 });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.status(500).json({ status: 500, message: messages.ECL093 });
        } finally {
            await queryRunner.release();
        }
    }
    async update(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { id } = req.params;
        const { name, entered_date, email, position_id, division_id } = req.body;
        let { password } = req.body;
        password = password === '' ? undefined : password;
        const user: User = Object.assign(new User(), {
            id, name, entered_date, password, email, position_id, division_id
        });
        try {
            const result = await this.userService.updateData(user, null, queryRunner, { checkUniqueMail: true, });
            if (result.status !== 200) {
                return res.status(result.status as number).json({ status: result.status, message: result.message ?? messages.ECL093 });
            }
            await queryRunner.commitTransaction();
            return res.status(200).json({ status: 200, message: result.message ?? messages.ECL096 });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.status(500).json({ status: 500, message: messages.ECL093 });
        } finally {
            await queryRunner.release();
        }
    }
    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const loginUserId = req.session.user?.id ?? req.user?.id;
        if (loginUserId === id) {
            return res.status(400).json({ message: messages.ECL086 });
        } else {
            const result: CustomEntityApiResult<User> = await this.userService.removeData(id);
            return res.status(result.status as number).json(result);
        }
    }

    /**
     * @deprecated this function is no longer being used, only for referencing
     */
    private async importCsv(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const msgObj: CustomEntityApiResult<User> = { messages: [], status: 500 };
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
            const records: unknown[] = await this.userService.readCsvData(req.file.path, parser);
            if (records.length === 0) {
                return res.status(400).json({ message: 'File is empty' });
            }
            const idRecords = records.filter((record: CustomUserData) => record['id'] !== '').map((record: CustomUserData) => record['id']);
            const emailRecords = records.filter((record: CustomUserData) => record['email'] !== '').map((record: CustomUserData) => record['email']);
            const deleteArr: User[] = []; // array of users to delete
            const insertArr: User[] = []; // array of users to insert
            const updateArr: User[] = []; // array of users to update
            // query data from db first then pass it around to prevent multiple query to db, only select id,username,email for performance reason
            const builder = this.userRepo.createQueryBuilder('user').select(['user.id', 'user.email']);
            if (idRecords.length > 0) {
                builder.orWhere('user.id IN (:ids)', { ids: idRecords });
            }
            if (emailRecords.length > 0) {
                builder.orWhere('user.email IN (:emails)', { emails: emailRecords, });
            }
            const dbData = await builder.getMany();
            const { start, end } = bench();
            start();
            const startValidateFunc = async () => {
                // iterate csv records data and check row
                for (let i = 0; i < records.length; i++) {
                    const row: CustomUserData = records[i] as CustomUserData;
                    const user: User = Object.assign(new User(), {
                        id: row['id'] === '' ? null : _.isString(row['id']) ? parseInt(row['id']) : row['id'],
                        name: row['name'] === '' ? null : row['name'],
                        email: row['email'] === '' ? null : row['email'],
                        division_id: row['division_id'] === '' ? null : row['division_id'],
                        position_id: row['position_id'] === '' ? null : row['position_id'],
                    });
                    // validate entity User imperatively using 'class-validator'
                    const errors: ValidationError[] = await validate(user);
                    if (errors.length > 0) {
                        const errMsgStr = errors.map(error => Object.values(error.constraints as { [type: string]: string; })).join(', ');
                        msgObj.messages?.push(`Row ${i + 1} : ${errMsgStr}`);
                        continue;
                    }
                    console.log('Reading csv row: ', i);
                    // + Trường hợp id rỗng => thêm mới user
                    if (_.isNil(row['id']) || row['id'] === '') {
                        if (row['deleted'] === 'y') {
                            // deleted="y" và colum id không có nhập thì không làm gì hết, ngược lại sẽ xóa row theo id tương ứng dưới DB trong bảng user
                            continue;
                        }
                        const result: CustomValidateResult<User> = await this.userService.checkEmailUnique(user, dbData,);
                        if (result.isValid === false) {
                            msgObj.messages?.push(`Row ${i + 1} : ${result.message}`);
                            continue;
                        }
                        user.password = getRandomPassword();
                        user.entered_date = new Date();
                        user.created_date = new Date();
                        user.updated_date = new Date();
                        user.division_id = 1;
                        user.position_id = _.random(0, 3);
                        dbData.push(user); // push to dbData to check unique later
                        insertArr.push(user); // push to map to insert later
                    } else {
                        // Trường hợp id có trong db (chứ ko phải trong transaction) => chỉnh sửa user nếu deleted != 'y'
                        const findUser = _.find(dbData, { id: user.id });
                        if (findUser) {
                            if (row['deleted'] === 'y') {
                                dbData.splice(dbData.indexOf(findUser), 1); // remove from dbData to check unique later
                                deleteArr.push(findUser); // push to map to delete later
                            } else {
                                const result: CustomValidateResult<User> = await this.userService.checkEmailUnique(user, dbData,);
                                if (result.isValid === false) {
                                    msgObj.messages?.push(`Row ${i + 1} : ${result.message}`,);
                                    continue;
                                }
                                user.updated_date = new Date();
                                dbData.splice(dbData.indexOf(result.data as User), 1, result.data as User,); // update dbData to check unique later
                                updateArr.push(user); // push to map to update later
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
                deleteArr.map(async user => { await queryRunner.manager.remove<User>(user); }),
            );
            await Promise.all(
                updateArr.map(async user => { await this.userService.updateData(user, dbData, queryRunner, { checkUniqueMail: false, }); }),
            );
            await Promise.all(
                insertArr.map(async user => { await this.userService.insertData(user, dbData, queryRunner, { checkUniqueMail: false, isPasswordHash: false, }); }),
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
    async exportCsv(req: Request, res: Response) {
        try {
            const { start, end } = bench();
            const query = req.session.searchQuery;
            if (!query || query?.draw === '1') {
                return res.status(400).json({ message: messages.ECL097, status: 400 });
            }
            const builder: SelectQueryBuilder<User> = await this.userService.getSearchQueryBuilder(query as Record<string, unknown>, false); // set false to turn off offset,limit search criteria
            const userList: CustomUserData[] = await builder.getRawMany();
            // if list is empty then return 404
            // userList = [];
            if (userList.length === 0) {
                return res.status(404).json({ message: messages.ECL097, status: 404 });
            }
            start();
            userList.map((user: CustomUserData) => {
                // user['Created Date'] = (user['Created Date'] as string).replace('/', '-');
                // user['Updated Date'] = (user['Updated Date'] as string).replace('/', '-');
                const a = user['Entered Date'];
                const b = dayjs(user['Entered Date'], { utc: true }).format();
                const c = dayjs(user['Entered Date']).format();
                const f = dayjs(user['Entered Date']).format('YYYY-MM-DD');
                const d = dayjs.utc(user['Entered Date']).format();
                const e = dayjs.utc(user['Entered Date']).format('YYYY-MM-DD');
                const x = dayjs(user['Entered Date']).format();
                const _new = f.slice(0, 10);

                // turn utc true because 2022-01-01 will turn to 2021-12-31 if utc is false... weird AF
                user['Entered Date'] = dayjs(user['Entered Date'], { utc: true }).format('YYYY-MM-DD');
                user['Created Date'] = dayjs(user['Created Date'], { utc: true }).format('YYYY-MM-DD');
                user['Updated Date'] = dayjs(user['Updated Date'], { utc: true }).format('YYYY-MM-DD');

                switch (user['Position'] as number | undefined) {
                    case 0: user['Position'] = POS_NAME.GE_DI; break;
                    case 1: user['Position'] = POS_NAME.GR_LE; break;
                    case 2: user['Position'] = POS_NAME.LE; break;
                    case 3: user['Position'] = POS_NAME.MEM; break;
                    default: user['Position'] = ''; break;
                }
            });
            const filename = `list_user_${dayjs(Date.now()).format('YYYYMMDDHHmmss',)}.csv`;
            const columns = Object.keys(userList[0]);
            // const columns_string = columns.toString().replace(/,/g, ',');
            stringify(userList, {
                header: true,
                columns: columns,
                delimiter: ',',
                quoted: true,
                quoted_empty: true,
            }, function (err, data) {
                if (err) {
                    return res.status(500).json({ message: messages.ECL097, status: 500 });
                }
                // data = '';
                // if list empty then export only header
                if (data.length === 0) {
                    // data = columns_string + '\n';
                    return res.status(200).json({ data: data, status: 200, message: messages.ECL097, filename: filename });
                } else {
                    // data = columns_string + '\n' + data;
                    end(); // end count time and log to console
                    return res.status(200).json({ data: data, status: 200, message: `Export to CSV success!, \nTotal records: ${userList.length}`, filename: filename });
                }
            });
        } catch (error) {
            return res.status(500).json({ message: messages.ECL097, status: 500 });
        }
    }
    //for routing control purposes - END
}

export default new UserApiController();
