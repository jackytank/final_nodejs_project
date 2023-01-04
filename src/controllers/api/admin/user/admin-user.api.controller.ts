import { POS_NAME } from './../../../../constants';
import { CustomDataTableResult } from './../../../../customTypings/express/index';
import { Request, Response } from 'express';
import _ from 'lodash';
import * as csv from 'csv-parse';
import { SelectQueryBuilder, } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { stringify } from 'csv-stringify';
import dayjs from 'dayjs';
import { UserService } from '../../../../services/user.services';
import { CustomEntityApiResult, CustomValidateResult, } from '../../../../customTypings/express';
import { User } from '../../../../entities/user.entity';
import { bench, getRandomPassword, isValidDate } from '../../../../utils/common';
import { UserModel } from '../../../../models/user.model';
import { AppDataSource } from '../../../../DataSource';
import { _1MB } from '../../../../constants';

interface CsvUserData {
    id: unknown;
    name: unknown;
    email: unknown;
    position_id: unknown;
    division_id: unknown;
    deleted: unknown;
}

class AdminUserApiController {
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
            req.session.searchQuery = req.query;
            const data: CustomDataTableResult = await this.userService.searchData(req.query);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: error.message, status: 500 });
        }
    }
    async getOne(req: Request, res: Response) {
        const result = await this.userService.getOneData(parseInt(req.params.id));
        return res.status(result.status as number).json(result);
    }
    async save(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name,
            username,
            password,
            email,
            role,
        });
        const result = await this.userService.insertData(user, null, queryRunner, {
            wantValidate: false,
            isPasswordHash: true,
        });
        return res.status(200).json(result);
    }
    async update(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { name, username, password, email, role } = req.body;
        const id = req.params.id;
        const user: User = Object.assign(new User(), {
            id,
            name,
            username,
            password,
            email,
            role,
        });
        const result = await this.userService.updateData(user, null, queryRunner, {
            wantValidate: false,
        });
        return res.status(result.status as number).json(result);
    }
    async remove(req: Request, res: Response) {
        const id = parseInt(req.params.id);
        const result = await this.userService.removeData(id);
        return res.status(result.status as number).json(result);
    }
    async importCsv(req: Request, res: Response) {
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
            const idRecords = records.filter((record: CsvUserData) => record['id'] !== '').map((record: CsvUserData) => record['id']);
            const emailRecords = records.filter((record: CsvUserData) => record['email'] !== '').map((record: CsvUserData) => record['email']);
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
                    const row: CsvUserData = records[i] as CsvUserData;
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
                updateArr.map(async user => { await this.userService.updateData(user, dbData, queryRunner, { wantValidate: false, }); }),
            );
            await Promise.all(
                insertArr.map(async user => { await this.userService.insertData(user, dbData, queryRunner, { wantValidate: false, isPasswordHash: false, }); }),
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
        const { start, end } = bench();
        const searchQuery = req.session.searchQuery;
        let builder: SelectQueryBuilder<User>;
        let userList: User[];
        if (searchQuery) {
            builder = await this.userService.getSearchQueryBuilder(searchQuery, false); // set false to turn off offset,limit search criteria
            userList = await builder.getRawMany();
        } else {
            userList = await this.userRepo.find();
        }
        // if list is empty then return 404
        // userList = [];
        if (userList.length === 0) {
            return res.status(404).json({ message: 'Database is empty!', status: 404 });
        }
        start();
        // format date, transform role number to string (Ex: '1' => 'User')
        userList.map((user: UserModel) => {
            user['created_date'] = isValidDate(user['created_date']) ? dayjs(user['created_date']).format('YYYY/MM/DD') : '';
            user['updated_date'] = isValidDate(user['updated_date']) ? dayjs(user['updated_date']).format('YYYY/MM/DD') : '';
            switch (user['position_id'] as number | undefined) {
                case 0: user['position_id'] = POS_NAME.GE_DI; break;
                case 1: user['position_id'] = POS_NAME.GR_LE; break;
                case 2: user['position_id'] = POS_NAME.LE; break;
                case 3: user['position_id'] = POS_NAME.MEM; break;
                default: break;
            }
            user['password'] = user['password'].replace(/./g, '*'); // Ex: '123456' to '******'
        });
        const filename = `list_user_${dayjs(Date.now()).format('YYYYMMDDHHmmss',)}.csv`;
        const columns = Object.keys(userList[0]);
        const columns_string = columns.toString().replace(/,/g, ',');
        stringify(userList, {
            // header: true,
            columns: columns,
            delimiter: ',',
            quoted: true,
            quoted_empty: true,
        }, function (err, data) {
            if (err) {
                res.status(500).json({ message: 'Internal Server Error\nFailed to export csv', status: 500 });
            }
            // data = '';
            // if list empty then export only header
            if (data.length === 0) {
                data = columns_string + '\n';
                res.status(200).json({ data: data, status: 200, message: 'Database is empty!', filename: filename });
            } else {
                data = columns_string + '\n' + data;
                end(); // end count time and log to console
                res.status(200).json({ data: data, status: 200, message: `Export to CSV success!, \nTotal records: ${userList.length}`, filename: filename });
            }
        });
    }
    //for routing control purposes - END
}

export default new AdminUserApiController();
