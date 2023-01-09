// @ts-nocheck
/**
 * ユーザーミドルウェア
 */
import * as configEnv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from 'http-status';

configEnv.config();

export default async (req: Request, res: Response, next: NextFunction) => {
    const apiEndpoint = process.env.API_ENDPOINT || '';
    const userSession =
        req.session === undefined ? undefined : req.session.user;
    if (userSession === undefined) {
        req.user = {
            id: undefined,
            username: undefined,
            isAuthorized: false,
            getServiceOption: () => ({
                endpoint: <string>apiEndpoint,
            }),
            destroy: () => undefined, // do nothing
        };

        res.locals.loginUser = {};
        res.locals.logoutRedirect = {};

        if (req.xhr) {
            res.status(UNAUTHORIZED).json({ success: false, message: 'unauthorized' });
        } else {
            next();
        }
    } else {
        req.user = {
            ...userSession,
            isAuthorized: true,
            destroy: () => {
                (<Express.Session>req.session).user = undefined; // delete user session
            },
        };
        // console.log(req.user);
        res.locals = {
            loginUser: req.user, logoutRedirect: encodeURIComponent(req.originalUrl),
        };
        next();
    }
};
