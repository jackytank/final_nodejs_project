import jwt from 'jsonwebtoken';
import * as configEnv from 'dotenv';
import { MemDBType } from '../customTypings/express';

configEnv.config();

export const jwt_mem_db = new Set<MemDBType>();

export const get_refresh_by_user_id = (user_id: number) => {
    const _tmp = jwt_mem_db;
    let refresh_token;
    jwt_mem_db.forEach((data) => {
        if (data.user_id === user_id) {
            refresh_token = data.refresh_token;
        }
    });
    return refresh_token;
};

export const check_refresh_valid = (refresh_token: string | undefined, token_secret?: string) => {
    let is_valid = true;
    if (!refresh_token) {
        is_valid = false;
    }
    jwt.verify(refresh_token as string, token_secret ?? process.env.REFRESH_SECRET as string, (err: any, user: any) => {
        if (err) {
            is_valid = false;
        }
    });
    return is_valid;
};