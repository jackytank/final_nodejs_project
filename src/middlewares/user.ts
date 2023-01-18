import { HashedData } from './../utils/common';
// @ts-nocheck
/**
 * ユーザーミドルウェア
 */
import * as configEnv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from 'http-status';
import { decrypt_aes_256 } from '../utils/common';

configEnv.config();

export default async (req: Request, res: Response, next: NextFunction) => {
    req.user = {
        // id: undefined,
        // email: undefined,
        // position_id: undefined,
        isAuthorized: false,
        // getServiceOption: () => ({
        //     endpoint: <string>apiEndpoint,
        // }),
        // destroy: () => undefined, // do nothing
    };

    res.locals.loginUser = {};
    res.locals.logoutRedirect = {};

    next();

};
