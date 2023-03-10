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
    },
    redirUrl?: string;
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userPos = req.session.user?.position_id ?? req.user.id;
        if (options.permitIf && options.permitIf.userSessionPropEqualPropFrom) {
            if (Object.keys(req.params).length !== 0 && options.permitIf.userSessionPropEqualPropFrom.params) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.params;
                const userSession = req.session.user ?? req.user;
                const prop = userSession?.[whichProp as keyof typeof userSession];
                if (req.params[whichProp].trim() === (typeof prop === 'string' ? prop === 'string' : prop?.toString())) {
                    return next();
                }
            }
            if (Object.keys(req.body).length !== 0 && options.permitIf.userSessionPropEqualPropFrom.body) {
                const { whichProp } = options.permitIf.userSessionPropEqualPropFrom.body;
                const userSession = req.session.user ?? req.user;
                const prop = userSession?.[whichProp as keyof typeof userSession];
                if (req.body[whichProp].trim() === (typeof prop === 'string' ? prop : prop?.toString())) {
                    return next();
                }
            }
        }
        if (userPos != null && options.posArr.includes(userPos)) {
            return next();
        } else {
            logger.logWarning(req, messages.FORBIDDEN);
            if (options.resAsApi === true) {
                return res.status(403).json({ status: 403, message: 'Forbidden' });

            }
            if (options.resAsApi === false || options.resAsApi == null) {
                if (options.redirUrl) {
                    return res.redirect(options.redirUrl);
                } else {
                    return res.render('errors/index', {
                        title: titleMessageError.FORBIDDEN,
                        content: messages.FORBIDDEN,
                    });
                }
            }
        }
    };
}

export const allowOnlyGeDi = (options: { resAsApi: boolean, redirUrl?: string;  }) => {
    return allow({ posArr: [POS_NUM.GE_DI], resAsApi: options.resAsApi, redirUrl: options.redirUrl });
};

export const allowGeDiExceptParams = (options: { resAsApi: boolean, redirUrl?: string; }) => {
    return allow({ posArr: [POS_NUM.GE_DI], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' } } }, redirUrl: options.redirUrl });
};
/**
 * @deprecated
 */
export const defaultAllow = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi });
};

/**
 * @deprecated
 */
export const allowParams = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GE_DI], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' } } } });
};
/**
 * @deprecated
 */
export const allowBody = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { body: { whichProp: 'id' } } } });
};
/**
 * @deprecated
 */
export const allowBoth = (options: { resAsApi: boolean; }) => {
    return allow({ posArr: [POS_NUM.GR_LE, POS_NUM.LE], resAsApi: options.resAsApi, permitIf: { userSessionPropEqualPropFrom: { params: { whichProp: 'id' }, body: { whichProp: 'id' } } } });
};
