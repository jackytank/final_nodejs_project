import { HashedData } from './../utils/common';
/**
 * Authentication Middlewares
*/
import jwt from 'jsonwebtoken';
import * as logger from '../utils/logger';
import { UNAUTHORIZED } from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { decrypt_aes_256 } from '../utils/common';

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

export const authentication_jwt = async (req: Request, res: Response, next: NextFunction) => {
    logger.logInfo(req);
    const hashedData = decrypt_aes_256(req.signedCookies['banhqui_antoan'] as HashedData);
    const banhqui = hashedData == null ? null : JSON.parse(hashedData);
    if (!banhqui?.token || !req.user?.isAuthorized) {
        req.user = {
            isAuthorized: false,
        };
        res.locals.loginUser = {};
        res.locals.logoutRedirect = {};
        return res.status(UNAUTHORIZED).redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
    jwt.verify(banhqui.token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
        console.log(err);
        if (err) {
            return res.status(UNAUTHORIZED).json({ success: false, message: 'Unauthorized Son...!' });
        }
        req.user = {
            ...banhqui.user,
            isAuthorized: true,
        };
        res.locals = {
            loginUser: banhqui.user, logoutRedirect: encodeURIComponent(req.originalUrl),
        };
        next();
    });
};
