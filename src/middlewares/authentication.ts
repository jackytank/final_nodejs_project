import { CustomBanhQui } from './../controllers/auth.controller';
import { HashedData, readJsonDB } from './../utils/common';
/**
 * Authentication Middlewares
*/
import jwt from 'jsonwebtoken';
import * as logger from '../utils/logger';
import { UNAUTHORIZED } from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { decrypt } from '../utils/common';
import * as configEnv from 'dotenv';

configEnv.config();

/**
 * If the user is not authorized, then redirect to login page
 */
export const authentication = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.isAuthorized) {
        res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    } else {
        try {
            if (!req.xhr) {
                // Audit log every action
                logger.logInfo(req);
            }
            next();
        } catch (err) {
            if (err.response && err.response.status === UNAUTHORIZED) {
                logger.logWarning(req, err);
                res.redirect(`/logout?redirect=${encodeURIComponent(req.originalUrl)}`);
                return;
            } else {
                next();
            }
        }
    }
};

export const memDB: string[] = [];

export const authentication_jwt = async (req: Request, res: Response, next: NextFunction) => {
    logger.logInfo(req);
    const parsed = req.signedCookies['banhqui_antoan'] == null ? null : JSON.parse(req.signedCookies['banhqui_antoan']);
    const hashedData = decrypt(parsed as HashedData);
    const banhqui: CustomBanhQui = hashedData == null ? null : JSON.parse(hashedData);
    req.user = {
        isAuthorized: false,
    };
    res.locals.loginUser = {};
    res.locals.logoutRedirect = {};

    if (!banhqui?.access_token) {
        return res.status(UNAUTHORIZED).redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
    let isATExpire = false;
    jwt.verify(banhqui.access_token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
        if (err) {
            isATExpire = true;
            console.log('Token expire');
            return res.status(UNAUTHORIZED).redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
        }
        req.user = {
            ...banhqui.user,
            isAuthorized: true,
        };
        res.locals = {
            loginUser: banhqui.user, logoutRedirect: encodeURIComponent(req.originalUrl),
        };
        return next();
    });
};
