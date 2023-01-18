// @ts-nocheck
/**
 * Login controller
*/
import jwt from 'jsonwebtoken';
import * as logger from '../utils/logger';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { UserService } from '../services/user/user.service';
import { messages } from '../constants';
import { User } from '../entities/user.entity';

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
export const auth_with_jwt = async (req: Request, res: Response) => {
    const { redirect } = req.query;
    const { email, password } = req.body;
    try {
        const userService = new UserService();
        const user: User | null = await userService.verifyCredentials(email, password);
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
            const expireTime = 1800; // 30mins
            const token = jwt.sign({ email }, process.env.TOKEN_SECRET as string, {
                expiresIn: expireTime // 30mins
            });
            // save user info into session
            req.user.isAuthorized = true;
            const toReturn = {
                user: {
                    ...(({ id, name, email, position_id }) => ({ id, name, email, position_id }))(user),
                },
                token: token
            };
            const decryptedToReturn = encrypt_aes_256(JSON.stringify(toReturn));
            res.cookie('banhqui_antoan', decryptedToReturn, {
                secure: true,
                httpOnly: true, // to prevent XSS attacks
                expires: true,
                maxAge: expireTime * 1000, // 30 mins in miliseconds
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
    req.signedCookies['banhqui_antoan'] = undefined;
    const { redirect } = req.query;
    // write log
    logger.logInfo(req, 'User logged out successfully.');
    let redirectURL = '/login';
    if (redirect !== undefined) {
        redirectURL += `?redirect=${encodeURIComponent(redirect!.toString())}`;
    }
    res.redirect(redirectURL);
};
