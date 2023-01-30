/**
 * Login controller
*/
import jwt from 'jsonwebtoken';
import { generate_refresh_token } from './../utils/common';
import * as logger from '../utils/logger';
import { Request, Response } from 'express';
import { UserService } from '../services/user/user.service';
import { messages } from '../constants';
import { User } from '../entities/user.entity';
import { encrypt, generate_access_token } from '../utils/common';
import { CustomBanhQui } from '../customTypings/express';
import * as configEnv from 'dotenv';
import { jwt_mem_db } from '../utils/jwt-utils';

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
            // signing access and refresh tokens
            const access_token = generate_access_token(user);
            const refresh_token = generate_refresh_token(user);
            // create object to return user, access and refresh tokens info
            req.user.isAuthorized = true;
            const to_return: CustomBanhQui = {
                user: {
                    ...(({ id, name, email, position_id }) => ({ id, name, email, position_id }))(user),
                },
                access_token: access_token,
            };
            jwt_mem_db.add({
                "user_id": user.id,
                "refresh_token": refresh_token
            });
            const encrypted_to_return = encrypt(JSON.stringify(to_return));
            res.cookie('banhqui_antoan', JSON.stringify(encrypted_to_return), {
                secure: true,
                httpOnly: true, // Cookies are vulnerable to XSS attacks. Hackers can read the info in cookies through JS scripts. To prevent, you can set the cookie’s property to HttpOnly
                signed: true,
                sameSite: 'strict' // Cookies are vulnerable to CSRF attacks => set SameSite to Strict
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




// const isvalid = checkExpire(access_token)
// if(!isvalid){
//         fetch('/refresh-token').then((res)=>{

// fetch('/user/list').then((res)=>{
//     if(res === 401){

//     }
// })
//         })
// }

// const accessToken = localStorage('accessToken')

// function getAccessTokenSilenlty() {
//     const payload = jwt.decoded(accessToken)
//     if(exp < now) {
//         return accessToken;
//     }

//             fetch('/refresh-token').then((res)=>{
// setLocal
// //
// return res.accessToken

//             }).catch()
// }


// const token = await getAccessTokenSilenlty()

// if() {

//     se4 bi loi
// }

// fetch('/user/list').then((res)=>{
  
// })