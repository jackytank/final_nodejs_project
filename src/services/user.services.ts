import { InsertResult, QueryRunner, SelectQueryBuilder, UpdateResult } from 'typeorm';
import _ from 'lodash';
import * as fs from 'fs';
import * as csv from 'csv-parse';
import * as nodemailer from 'nodemailer';
import { User } from '../entities/user.entity';
import { comparePassword, hashPassword } from '../utils/bcrypt';
import { CustomEntityApiResult, CustomDataTableResult, CustomValidateResult, CustomApiResult } from '../customTypings/express';
import { Division } from '../entities/division.entity';
import { isValidDate, setAllNull } from '../utils/common';
import { AppDataSource } from '../DataSource';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class UserService {
    private userRepo = AppDataSource.getRepository(User);

    async verifyCredentials(email: string, password: string) {
        const foundUser = await this.userRepo.findOneBy({ email: email });
        if (!foundUser) {
            return null;
        }
        // validate password
        const passwordMatched = await comparePassword(password, foundUser!.password);
        if (!passwordMatched) {
            return null;
        }
        // update last_login
        // foundUser.lastLogin = getCurrentSystemDatetime();
        foundUser.updated_date = new Date();
        await this.userRepo.update(foundUser.id, foundUser);
        return foundUser;
    }
    /**
     * @param filePath accept absolute path
     * @param parser accept csv.Parser type
     * @returns return an array of unknown object
     */
    async readCsvData(filePath: string, parser: csv.Parser): Promise<unknown[]> {
        const result: unknown[] = [];
        return await new Promise((resolve, reject) =>
            fs
                .createReadStream(filePath)
                .pipe(parser)
                .on('data', row => {
                    result.push(row);
                })
                .on('error', err => {
                    reject(err);
                })
                .on('end', () => {
                    // xóa file csv sau khi đã đọc xong
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                    resolve(result);
                }),
        );
    }
    /**
     * 
     * @param take equavalent to offset
     * @param limit equivalent to limit
     * @returns return CustomApiResult<User> with status, data, and count
     */
    async getAllData(take?: string, limit?: string): Promise<CustomEntityApiResult<User>> {
        const builder = this.userRepo.createQueryBuilder('user').select('user');
        let users: User[];
        try {
            // check if limit query is exist to prevent: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            let hasLimit = false;
            if (!_.isNil(limit) && !_.isEmpty(limit)) {
                const _limit = parseInt(limit);
                if (_.isFinite(_limit)) {
                    hasLimit = true;
                    builder.limit(_limit);
                }
            }
            if (!_.isNil(take) && !_.isEmpty(take) && hasLimit) {
                const _take = parseInt(take);
                if (_.isFinite(_take)) {
                    builder.offset(_take);
                }
            }
            users = await builder.getMany();
        } catch (error) {
            users = await this.userRepo.find();
            console.log(error.message);
        }
        // users = await this.find();
        return { data: users, status: 200, count: users.length };
    }
    /**
     * @ignore don't use this function, it's only for testing
     * @param query accept express.Request.query
     * @returns return user info combined with UserProfile and Company info of that user
     */
    private async getAllDataWithExtraPersonalInfo(query: Record<string, unknown>): Promise<CustomEntityApiResult<User>> {
        const { companyId, companyName } = query;
        const b = this.userRepo.createQueryBuilder('u');
        let users: User[] | null = null;
        try {
            b.select([
                'u.id AS `id`',
                'u.role AS `role`',
                'u.username AS `username`',
                'u.company_id AS `companyId`',
                'c.name AS `companyName`',
                'p.phone AS `phone`',
                'p.address AS `address`',
                "CONCAT(p.lastname,' ', p.firstname) AS `fullname`",
            ]);
            if (companyId || companyName) {
                b.leftJoin(Division, 'p', 'u.id = p.user_id');
                b.innerJoin(Division, 'c', 'u.division_id = c.id');
                b.where('');
                if (companyId) {
                    b.andWhere('c.id = :companyId', { companyId: companyId });
                }
                if (companyName) {
                    b.andWhere('c.name = :companyName', { companyName: companyName });
                }
            }
            users = await b.getRawMany();
            const count = users.length;
            return { data: users, status: 200, count: count };
        } catch {
            return { message: `Error`, status: 500 };
        }
    }
    async getOneData(id: number): Promise<CustomEntityApiResult<User>> {
        try {
            const findUser: User | null = await this.userRepo.findOne({
                where: { id: id },
            });
            if (!findUser) {
                return { message: `User ID ${id} Not Found!`, status: 404 };
            }
            return {
                message: `Found user with id ${id}`,
                data: findUser,
                status: 200,
            };
        } catch (error) {
            return { message: `Error when get one user`, status: 500 };
        }
    }
    /**
     * 
     * @param user accept User object
     * @param dbData if dbData is provided then it will not query to database to check username and email unique instead it will use dbData to check
     * @returns return CustomValidateResult<User> with message, isValid, and datas
     */
    async checkEmailUnique(user: User, dbData?: User[] | null): Promise<CustomValidateResult<User>> {
        const b: SelectQueryBuilder<User> = this.userRepo.createQueryBuilder('user').where('');
        let result = {
            message: '',
            isValid: false,
            datas: null as User[] | null,
        };
        let findUsers: User[] = [];
        if (user.email) {
            if (!dbData) {
                if (user.id) {
                    b.orWhere('user.email = :email AND user.id <> :id', { email: `${user.email}`, id: user.id });
                } else {
                    b.orWhere('user.email = :email', { email: `${user.email}` });
                }
            } else {
                if (user.id) {
                    findUsers = dbData.filter(data => data.email === user.email && data.id !== user.id);
                } else {
                    findUsers = dbData.filter(data => data.email === user.email);
                }
            }
            if (findUsers.length > 0) {
                result = Object.assign({}, {
                    message: 'Email is already exist!',
                    isValid: false,
                    datas: findUsers,
                },);
                return result;
            }
        }
        return {
            message: 'Email is unique!',
            isValid: true,
            datas: findUsers,
        };
    }
    /**
     * 
     * @param user accept User object
     * @param dbData it will use dbData array to check username and email unique
     * @param queryRunner accept QueryRunner object
     * @param options if wantValidate is true then it will check username and email unique
     * @returns return CustomApiResult<User> with message, data, and status
     */
    async insertData(user: User, dbData: User[] | null, queryRunner: QueryRunner, options: { wantValidate?: boolean; isPasswordHash?: boolean; },): Promise<CustomEntityApiResult<User>> {
        if (options.wantValidate) {
            const validateUser = await this.checkEmailUnique(user, dbData);
            if (!validateUser.isValid) {
                return { message: validateUser.message, status: 400 };
            }
        }
        user.created_date = new Date();
        // hash pass if isPasswordHash is true, incase of insert data from csv file (already had pass)
        if (options.isPasswordHash) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        try {
            let insertedUser: User | InsertResult;
            if (dbData) {
                insertedUser = await queryRunner.manager.save(User, user);
            } else {
                insertedUser = await queryRunner.manager.save(User, user);
            }
            if (dbData) {
                dbData.push(insertedUser as User);
            }
            // const newUser: User | null = await queryRunner.manager.findOneBy(User, { id: insertRes.identifiers[0].id });
            return {
                message: 'User created successfully!',
                data: insertedUser as User,
                status: 200,
            };
        } catch (error) {
            return { message: 'Error when inserting user!', status: 500 };
        }
    }
    /**
     * 
     * @param user accept User object
     * @param dbData if dbData is provided then it will not query to database to check username and email unique instead it will use dbData to check
     * @param queryRunner accept QueryRunner object
     * @param options if wantValidate is true then it will check username and email unique, if user id is provided then it will not check username and email unique
     * @returns return CustomApiResult<User> with message, data, and status
     */
    async updateData(user: User, dbData: User[] | null, queryRunner: QueryRunner, options: { wantValidate?: boolean; }): Promise<CustomEntityApiResult<User>> {
        let validateUser = null;
        if (options.wantValidate) {
            validateUser = await this.checkEmailUnique(user, dbData);
            if (!validateUser.isValid) {
                const arr: number[] | undefined = validateUser.datas?.map(u => u.id);
                if (!arr?.includes(user.id)) {
                    return { message: validateUser.message, status: 400 };
                }
            }
        }
        user.updated_date = new Date();
        if (!_.isNil(user.password)) {
            const hashed = await hashPassword(user.password);
            user.password = hashed;
        }
        // check if user exist by id
        const findUser: User | null = await queryRunner.manager.findOneBy(User, {
            id: user.id,
        });
        if (!findUser) {
            return { message: `User ${user.id} not found`, status: 404 };
        }
        try {
            let updatedUser: User | UpdateResult;
            // encode special character to prevent html injection
            if (dbData) {
                updatedUser = await queryRunner.manager.save(User, user);
            } else {
                updatedUser = await queryRunner.manager.update(User, { id: user.id }, user);
            }
            if (dbData) {
                dbData.push(updatedUser as User);
            }
            return {
                message: `Update user successfully!`,
                data: updatedUser as User,
                status: 200,
            };
        } catch (error) {
            return { message: `Error when updating user!`, status: 500 };
        }
    }
    /**
     * 
     * @param id accept user id as number
     * @returns return CustomApiResult<User> with message, data, and status
     */
    async removeData(id: number): Promise<CustomEntityApiResult<User>> {
        try {
            const userToRemove: User | null = await this.userRepo.findOneBy({ id });
            if (!userToRemove) {
                return { message: `User ID ${id} Not Found`, status: 404 };
            }
            await this.userRepo.remove(userToRemove);
            return { message: `User removed successfully`, status: 200 };
        } catch (error) {
            return { message: `Error when removing user`, status: 500 };
        }
    }
    /**
     * it will get QueryBuilder from getSearchQueryBuilder function and then it will get data from database based on query 
     * @param query accept query object
     * @returns return CustomDataTableResult with draw, recordsTotal, recordsFiltered, and data mainly for dataTable in frontend, data is array of User entity plus company_name column
     */
    async searchData(query: Record<string, unknown>): Promise<CustomDataTableResult> {
        const builder = await this.getSearchQueryBuilder(query, true);
        let data: string | User[];
        const recordsTotal: number = await this.userRepo.count(); // get total records count
        let recordsFiltered: number; // get filterd records count
        try {
            data = await builder.getRawMany(); //get data
            recordsFiltered = await builder.getCount(); // get filterd records count
        } catch (error) {
            // if error then find all
            console.log(error);
            data = [];
            recordsFiltered = recordsTotal;
        }
        const returnData = {
            draw: query.draw as number,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data,
        };
        return returnData;
    }
    async getSearchQueryBuilder(query: Record<string, unknown>, hasAnyLimitOrOffset: boolean): Promise<SelectQueryBuilder<User>> {
        const { length, start, name, enteredDateFrom, enteredDateTo } = setAllNull(query, { isEmpty: true });
        const b = this.userRepo.createQueryBuilder('user').select(['user.*']);
        // select(['user.*', 'company.name as `company_name`'])
        // .leftJoin('companies', 'company', 'company.id = user.company_id');

        // let isFromAndToDateEqual = false;
        // check if queries exist then concat them with sql query
        if (hasAnyLimitOrOffset) {
            let hasLimit = false;
            if (!_.isNil(length)) {
                hasLimit = true;
                b.limit(parseInt(length as string));
            }
            // check both start end length for error: typeorm RDBMS does not support OFFSET without LIMIT in SELECT statements
            if (!_.isNil(start) && !_.isNil(length) && hasLimit) {
                b.offset(parseInt(start as string));
            }
        }
        if (!_.isNil(enteredDateFrom) && isValidDate(new Date(enteredDateFrom as string))) {
            b.andWhere('Date(user.entered_date) >= :fromDate', { fromDate: `${enteredDateFrom}` });
        }
        if (!_.isNil(enteredDateTo) && isValidDate(new Date(enteredDateTo as string))) {
            b.andWhere('Date(user.entered_date) <= :toDate', { toDate: `${enteredDateTo}` });
        }
        if (!_.isNil(name)) {
            b.andWhere('user.name LIKE :name', { name: `%${name}%` });
        }
        b.andWhere('user.deleted_date = :isDeleted', { isDeleted: false })
        b.orderBy('user.name', 'ASC');
        return b;
    }
    /**
     * @ignore don't use this function, it's for testing purpose only
     */
    private async sendEmail(options: { from: string, to: string, subject: string, content: string; }): Promise<CustomApiResult> {
        try {
            const acc = await nodemailer.createTestAccount();
            const transporter = nodemailer.createTransport({
                host: acc.smtp.host,
                port: acc.smtp.port,
                secure: acc.smtp.secure, // true for 465, false for other ports
                auth: {
                    user: acc.user,
                    pass: acc.pass
                }
            });

            const info = await transporter.sendMail({
                from: options.from,
                to: options.to,
                subject: options.subject,
                text: options.content,
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return { message: `Email sent successfully`, status: 200 };
        } catch (error) {
            console.log(error);
            return { message: `Error when sending email`, status: 500 };
        }
    }
}
