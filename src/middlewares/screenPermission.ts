import { Request, Response, NextFunction } from 'express';
import { titleMessageError, messages, POS_NUM } from '../constants';
import * as logger from '../utils/logger';

/**
 * List of roles to be able to access to the screen
 * @param roles
 */
// export const permission = (roles: number[]) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!roles.includes((req.user.role as number) || 0)) {
//             logger.logWarning(req, `権限エラー`);

//             res.render('errors/index', {
//                 title: titleMessageError.FORBIDDEN,
//                 content: messages.FORBIDDEN,
//             });

//             return;
//         }
//         next();
//     };
// };


/**
 * Permit user by comparing list of roles to user session role, permit user if req.params or req.body has a certain property equal to a certain property of user session
 */
function allow(options: {
    posArr: number[];
    resAsApi: boolean;
    permitIf?: {
        userSessionPropEqualPropFrom?: {
            params?: {
                whichProp: string;
            };
            body?: {
                whichProp: string;
            };
        };
    };
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userPos = req.session.user?.position_id;
        if (options.permitIf && options.permitIf.userSessionPropEqualPropFrom) {
            if (Object.keys(req.params).length !== 0 && options.permitIf.userSessionPropEqualPropFrom.params) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.params;
                const userSession = req.session === undefined ? undefined : req.session.user;
                const prop = userSession?.[whichProp as keyof typeof userSession];
                if (req.params[whichProp].trim() === (typeof prop === 'string' ? prop === 'string' : prop?.toString())) {
                    next();
                    return;
                }
            }
            if (Object.keys(req.body).length !== 0 && options.permitIf.userSessionPropEqualPropFrom.body) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.body;
                const userSession = req.session === undefined ? undefined : req.session.user;
                const prop = userSession?.[whichProp as keyof typeof userSession];
                if (req.body[whichProp].trim() === (typeof prop === 'string' ? prop : prop?.toString())) {
                    next();
                    return;
                }
            }
        }
        if (userPos && options.posArr.includes(userPos)) {
            next();
            return;
        } else {
            if (options.resAsApi === true) {
                return res.status(403).json({ status: 403, message: 'Forbidden' });
            }
            if (options.resAsApi === false || options.resAsApi === undefined || options.resAsApi === null) {
                logger.logWarning(req, messages.FORBIDDEN);
                return res.render('errors/index', {
                    title: titleMessageError.FORBIDDEN,
                    content: messages.FORBIDDEN,
                });
            }
        }
    };
}
/**
 * 
 * @param options accept resAsApi as boolean
 * @returns as http status code 403 if options.resAsApi is true, otherwise render error page
 */
export const defaultAllow = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi });
};
/**
 * 
 * @param options accept resAsApi as boolean
 * @returns return as http status code 403 if options.resAsApi is true, otherwise render error page
 */
export const allowParams = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' } } } });
};
/**
 * 
 * @param options accept resAsApi as boolean
 * @returns return as http status code 403 if options.resAsApi is true, otherwise render error page
 */
export const allowBody = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { body: { whichProp: 'id' } } } });
};
/**
 * 
 * @param options accept resAsApi as boolean
 * @returns return as http status code 403 if options.resAsApi is true, otherwise render error page
 */
export const allowBoth = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' }, body: { whichProp: 'id' } } } });
};
