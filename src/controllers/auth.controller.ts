import { writeJsonDB, readJsonDB } from './../utils/common';
/**
 * Login controller
*/
import jwt from 'jsonwebtoken';
import * as logger from '../utils/logger';
import { Request, Response } from 'express';
import { UserService } from '../services/user/user.service';
import { messages } from '../constants';
import { User } from '../entities/user.entity';
import * as configEnv from 'dotenv';
import { encrypt } from '../utils/common';
import { memDB } from '../middlewares/authentication';

configEnv.config();

/**
 * GET login
 */
export const login = (req: Request, res: Response) => {
    const flashMessage = req.flash('message')[0];
    res.render('login/index', {
        layout: 'layout/loginLayout',
        message: flashMessage ?? '',
        email: ''
    });
};

/**
 * POST login
 */
export const auth = async (req: Request, res: Response) => {
    const { redirect } = req.query;
    const { email, password } = req.body;
    try {
        // get a User repository to perform operations with User
        const userService = new UserService();
        // load a post by a given post id
        const user = await userService.verifyCredentials(email, password);
        if (!user) {
            // write log
            logger.logInfo(req, `Failed login attempt: username(${email || ''}, password(${password || ''})`,
            );
            res.render('login/index', {
                layout: 'layout/loginLayout',
                email: email,
                message: messages.ECL017,
            });
        }
        if (user) {
            // save user info into session
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            (req.session as Express.Session).user = { ...user, };
            req.user.isAuthorized = true;
            // write log
            logger.logInfo(req, `User id(${user!.id}) logged in successfully.`);
            // If [ログイン] clicked, then redirect to TOP page
            if (redirect !== undefined && redirect.length! > 0 && redirect !== '/') {
                res.redirect(decodeURIComponent(redirect!.toString()));
            } else {
                res.redirect('/');
            }
        }
    } catch (err) {
        // write log
        logger.logInfo(req, `Failed login attempt: email(${email || ''})`);
        res.render('login/index', {
            layout: 'layout/loginLayout',
            email: email,
            message: messages.ECL017,
        });
    }
};

/**
 * This func auth_with_jwt is for research jwt purposes, use above func auth whenever possible.
 */
export interface CustomBanhQui {
    user: Record<string, unknown>,
    access_token: string,
    refresh_token: string;
}

export const auth_with_jwt = async (req: Request, res: Response) => {
    const { redirect } = req.query;
    const { email, password } = req.body;
    try {
        const user_service = new UserService();
        const user: User | null = await user_service.verifyCredentials(email, password);
        if (!user) {
            logger.logInfo(req, `Failed login attempt: username(${email || ''}, password(${password || ''})`,
            );
            res.render('login/index', {
                layout: 'layout/loginLayout',
                email: email,
                message: messages.ECL017,
            });
        }
        if (user) {
            const access_token_expire = parseInt(process.env.TOKEN_EXPIRE as string); // 30 mins
            const refresh_token_expire = parseInt(process.env.REFRESH_EXPIRE as string); // 15 days

            // signing access and refresh tokens
            const access_token = jwt.sign({ email }, process.env.TOKEN_SECRET as string, {
                expiresIn: access_token_expire
            });
            const refresh_token = jwt.sign({ email }, process.env.REFRESH_SECRET as string, {
                expiresIn: refresh_token_expire
            });
            // create object to return user, access and refresh tokens info
            req.user.isAuthorized = true;
            const to_return: CustomBanhQui = {
                user: {
                    ...(({ id, name, email, position_id }) => ({ id, name, email, position_id }))(user),
                },
                access_token: access_token,
                refresh_token: refresh_token
            };
            memDB.push(to_return.refresh_token);
            const test = memDB;
            const encrypted_to_return = encrypt(JSON.stringify(to_return));
            res.cookie('banhqui_antoan', JSON.stringify(encrypted_to_return), {
                secure: true,
                httpOnly: true, // to prevent XSS attacks
                signed: true,
                sameSite: 'strict'
            });
            logger.logInfo(req, `User id(${user!.id}) logged in successfully.`);
            if (redirect !== undefined && redirect.length! > 0 && redirect !== '/') {
                res.redirect(decodeURIComponent(redirect!.toString()));
            } else {
                res.redirect('/');
            }
        }
    } catch (err) {
        // write log
        console.log(err);
        logger.logInfo(req, `Failed login attempt: email(${email || ''})`);
        res.render('login/index', {
            layout: 'layout/loginLayout',
            email: email,
            message: messages.ECL017,
        });
    }
};
/**
 * GET logout
 */
export const logout = async (req: Request, res: Response) => {
    req.user = undefined;
    res.clearCookie('banhqui_antoan');
    const { redirect } = req.query;
    // write log
    logger.logInfo(req, 'User logged out successfully.');
    let redirectURL = '/login';
    if (redirect !== undefined) {
        redirectURL += `?redirect=${encodeURIComponent(redirect!.toString())}`;
    }
    res.redirect(redirectURL);
};

