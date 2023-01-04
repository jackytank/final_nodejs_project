import { BaseModel } from './base.model';

export class UserModel extends BaseModel {
    position_id: number | string;
    email: string;
    name: string;
    password: string;
    division_id: number;
    entered_date: Date;
}
