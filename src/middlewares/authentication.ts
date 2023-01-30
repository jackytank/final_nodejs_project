import { HashedData } from './../utils/common';
/**
 * Authentication Middlewares
*/
import jwt from 'jsonwebtoken';
import * as logger from '../utils/logger';
import { UNAUTHORIZED } from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { decrypt, encrypt, generate_access_token } from '../utils/common';
import * as configEnv from 'dotenv';
import { CustomBanhQui, MemDBType } from '../customTypings/express';
import { get_refresh_by_user_id, check_refresh_valid, jwt_mem_db } from '../utils/jwt-utils';
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

export const authentication_jwt = async (req: Request, res: Response, next: NextFunction) => {
    logger.logInfo(req);
    // instead of reading access/refresh token from Header 'Authorization', we read signed cookies that has tokens from every request 
    const parsed = req.signedCookies['banhqui_antoan'] == null ? null : JSON.parse(req.signedCookies['banhqui_antoan']);
    const hashed_data = decrypt(parsed as HashedData);
    const banhqui: CustomBanhQui = hashed_data == null ? null : JSON.parse(hashed_data);
    req.user = {
        isAuthorized: false,
    };
    res.locals.loginUser = {};
    res.locals.logoutRedirect = {};

    if (!banhqui?.access_token) {
        return res.status(UNAUTHORIZED).redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
    let is_ok = true;
    jwt.verify(banhqui.access_token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
        if (err) {
            is_ok = false;
            if (err.name === 'TokenExpiredError') {
                console.log('1. Access Token expire!');
                console.log('2. Begin checking refresh token...');
                const refresh_token = get_refresh_by_user_id(banhqui.user.id as number);
                is_ok = check_refresh_valid(refresh_token);
                if (!is_ok && refresh_token) {
                    // if refresh token is expired then delete it from in-mem db
                    jwt_mem_db.delete(refresh_token);
                }
                if (is_ok && refresh_token) {
                    console.log('3. Refresh token valid, generating new access token cookie...');
                    console.log('4. Old access token: ');
                    console.log(banhqui.access_token);
                    const access_token = generate_access_token(banhqui.user);
                    console.log('5. New access token: ');
                    console.log(access_token);
                    const to_return: CustomBanhQui = {
                        user: banhqui.user,
                        access_token: access_token,
                    };
                    const encrypted_to_return = encrypt(JSON.stringify(to_return));
                    res.clearCookie('banhqui_antoan');
                    res.cookie('banhqui_antoan', JSON.stringify(encrypted_to_return), {
                        secure: true,
                        httpOnly: true, // Cookies are vulnerable to XSS attacks. Hackers can read the info in cookies through JS scripts. To prevent, you can set the cookie’s property to HttpOnly
                        signed: true,
                        sameSite: 'strict' // Cookies are vulnerable to CSRF attacks => set SameSite to Strict
                    });
                }
            }
        }
    });
    if (is_ok) {
        req.user = {
            ...banhqui.user,
            isAuthorized: true,
        };
        res.locals = {
            loginUser: banhqui.user, logoutRedirect: encodeURIComponent(req.originalUrl),
        };
        return next();
    } else {
        return res.status(UNAUTHORIZED).redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
};
