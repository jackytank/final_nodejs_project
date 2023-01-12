import _ from "lodash";
import * as fs from 'fs';
import * as csv from 'csv-parse';
import { InsertResult, QueryRunner, SelectQueryBuilder, UpdateResult } from "typeorm";
import { CustomDataTableResult, CustomEntityApiResult } from "../../customTypings/express";
import { AppDataSource } from "../../DataSource";
import { Division } from "../../entities/division.entity";
import { User } from "../../models";
import { isValidDate, setAllNull } from "../../utils/common";
import { messages } from "../../constants";

export class DivisionService {
    private divRepo = AppDataSource.getRepository(Division);

    /**
 * it will get QueryBuilder from getSearchQueryBuilder function and then it will get data from database based on query 
 * @param query accept query object
 * @returns return CustomDataTableResult with draw, recordsTotal, recordsFiltered, and data mainly for dataTable in frontend, data is array of User entity plus company_name column
 */
    async searchData(query: Record<string, unknown>): Promise<CustomDataTableResult> {
        const builder = await this.getSearchQueryBuilder(query, true);
        let data: string | Division[];
        const recordsTotal: number = await this.divRepo.count(); // get total records count
        let recordsFiltered: number; // get filterd records count
        try {
            data = await builder.getRawMany(); //get data
            recordsFiltered = await builder.getCount(); // get filterd records count
        } catch (error) {
            // if error then set []
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
    async getSearchQueryBuilder(query: Record<string, unknown>, hasAnyLimitOrOffset: boolean): Promise<SelectQueryBuilder<Division>> {
        const { length, start } = setAllNull(query, { isEmpty: true });
        const b = this.divRepo.createQueryBuilder('d')
            .select(['d.id as `ID`', 'd.name as `Division Name`', 'd.note as `Division Note`', 'u.name as `Division Leader`', 'd.division_floor_num as `Floor Number`',
                'd.created_date as `Created Date`', 'd.updated_date as `Updated Date`', 'd.deleted_date as `Deleted Date`'])
            .leftJoin('user', 'u', 'u.id = d.division_leader_id');
        b.orderBy('d.id', 'ASC')
            .withDeleted();
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
        return b;
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
                    // delete CSV file after done 
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
 * @param user accept User object
 * @param dbData it will use dbData array to check username and email unique
 * @param queryRunner accept QueryRunner object
 * @param options if wantValidate is true then it will check username and email unique
 * @returns return CustomApiResult<User> with message, data, and status
 */
    async insertData(user: Division, dbData: Division[] | null, queryRunner: QueryRunner): Promise<CustomEntityApiResult<Division>> {
        user.created_date = new Date();
        user.updated_date = new Date();
        try {
            let insertedUser: Division | InsertResult;
            if (dbData) {
                insertedUser = await queryRunner.manager.save(Division, user);
            } else {
                insertedUser = await queryRunner.manager.save(Division, user);
            }
            if (dbData) {
                dbData.push(insertedUser as Division);
            }
            return {
                message: messages.ECL096,
                data: insertedUser as Division,
                status: 200,
            };
        } catch (error) {
            return { message: messages.ECL093, status: 500 };
        }
    }
    /**
     * 
     * @param div accept User object
     * @param dbData if dbData is provided then it will not query to database to check username and email unique instead it will use dbData to check
     * @param queryRunner accept QueryRunner object
     * @param options if wantValidate is true then it will check username and email unique, if user id is provided then it will not check username and email unique
     * @returns return CustomApiResult<User> with message, data, and status
     */
    async updateData(div: Division, dbData: Division[] | null, queryRunner: QueryRunner): Promise<CustomEntityApiResult<Division>> {
        // check if user exist by id
        const findDiv: Division | null = await queryRunner.manager.findOneBy(Division, {
            id: div.id,
        });
        if (!findDiv) {
            return { message: `Division ${div.id} not found`, status: 404 };
        }
        try {
            let updatedDiv: Division | UpdateResult;
            if (dbData) {
                updatedDiv = await queryRunner.manager.save(Division, div);
            } else {
                updatedDiv = await queryRunner.manager.update(Division, { id: div.id }, div);
            }
            if (dbData) {
                dbData.push(updatedDiv as Division);
            }
            return {
                message: messages.ECL096,
                data: updatedDiv as Division,
                status: 200,
            };
        } catch (error) {
            return { message: messages.ECL093, status: 500 };
        }
    }
}