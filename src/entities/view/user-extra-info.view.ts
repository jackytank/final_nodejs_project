import { DataSource, ViewEntity } from "typeorm";
import { AppDataSource } from "../../DataSource";
import { User } from "../user.entity";

@ViewEntity({
    expression: (dataSource: DataSource) =>
        dataSource.createQueryBuilder(User, 'u')
            .select([
                'u.id AS `id`',
                'u.role AS `role`',
                'u.username AS `username`',
                'u.company_id AS `companyId`',
                'c.name AS `companyName`',
                'p.phone AS `phone`',
                'p.address AS `address`',
                "CONCAT(p.lastname,' ', p.firstname) AS `fullname`",
            ]).leftJoin('user_profiles', 'p', 'u.id = p.user_id')
            .innerJoin('companies', 'c', 'u.company_id = c.id')
            .where('')
})
export class UserExtraInfoView {
    id: number;
    role: number;
    username: string;
    companyId: number;
    companyName: string;
    phone: string;
    address: string;
    fullname: string;
}