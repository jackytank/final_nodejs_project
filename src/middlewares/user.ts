import { HashedData } from './../utils/common';
// @ts-nocheck
/**
 * ユーザーミドルウェア
 */
import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from 'http-status';
import * as configEnv from 'dotenv';

configEnv.config();

export default async (req: Request, res: Response, next: NextFunction) => {
    req.user = {
        isAuthorized: false,
    };
    res.locals.loginUser = {};
    res.locals.logoutRedirect = {};
    return next();
};
