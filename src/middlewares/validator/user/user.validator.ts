import { body, check, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { blackListWords, errMsg, messages } from '../../../constants';
import { PosEnum } from '../../../entities/user.entity';
import DOMPurify from 'isomorphic-dompurify';
import eastasianwidth from '../../../utils/eastasianwidth';
import _ from 'lodash';

/**
 * 
 * @param options if hasRetype is true then retype must be equal to password, if hasPass is true then password must be provided
 * @returns return an array of express-validator rules for user validation
 */
export const userExpressValidationRule = (options: { hasRetype: boolean; hasPass: boolean; passAndRetypeOptional: boolean; }) => {
    // task validation: https://redmine.bridevelopment.com/issues/106778
    const ruleArr = [
        body('name')
            // .customSanitizer((value) => {
            //     return DOMPurify.sanitize(value);
            // })
            .not()
            .isEmpty().withMessage(messages.ECL001('User Name'))
            .bail()
            .custom((value, { req }) => {
                if (eastasianwidth.isStringContainsFullWidth(value)) {
                    return Promise.reject(messages.ECL004('User Name'));
                }
                return Promise.resolve(true);
            })
            .bail()
            .custom((value, { req }) => {
                const maxLength = 50;
                if (value.length > maxLength) {
                    return Promise.reject(messages.ECL002('User Name', maxLength, value.length));
                }
                return Promise.resolve(true);
            })
            .trim(),
        body('email')
            // .customSanitizer((value) => {
            //     return DOMPurify.sanitize(value);
            // })
            .not()
            .isEmpty().withMessage(messages.ECL001('Email'))
            .bail()
            .custom((value, { req }) => {
                if (eastasianwidth.isStringContainsFullWidth(value)) {
                    return Promise.reject(messages.ECL004('Email'));
                }
                return Promise.resolve(true);
            })
            .bail()
            .custom((value, { req }) => {
                const maxLength = 255;
                if (value.length > maxLength) {
                    return Promise.reject(messages.ECL002('Email', maxLength, value.length));
                }
                return Promise.resolve(true);
            })
            .bail()
            .isEmail().withMessage(messages.ECL005)
            // .normalizeEmail() // Ex: @gMaiL.CoM -> @gmail.com, lowercase domain part because it case-insensitive
            .trim(),
        body('position_id')
            .customSanitizer((value) => {
                return (typeof value === 'string') ? parseInt(value) : value;
            })
            .not()
            .isEmpty().withMessage(messages.ECL001('Position'))
            .bail()
            .isIn(Object.values(PosEnum).concat(Object.values(PosEnum).map((n) => n + "")))  // Ex: [1, 2, 3, '1', '2', '3']
            .withMessage(errMsg.ERR003('position_id')),
        body('division_id')
            .customSanitizer((value) => {
                return (typeof value === 'string') ? parseInt(value) : value;
            })
            .not()
            .isEmpty().withMessage(messages.ECL001('Division')),
        body('entered_date')
            .optional()
            .not()
            .isEmpty().withMessage(messages.ECL001('Entered Date'))
            .bail()
            .custom((value, { req }) => {
                if (eastasianwidth.isStringContainsFullWidth(value)) {
                    return Promise.reject(messages.ECL004('Entered Date'));
                }
                return Promise.resolve(true);
            })
            .bail()
            .isDate({ delimiters: ['/'], format: 'YYYY/MM/DD', strictMode: true }).withMessage(messages.ECL008('Entered Date')),
        body('password')
            .optional({ checkFalsy: true })
            .not()
            .isEmpty().withMessage(messages.ECL001('Password'))
            .bail()
            .isLength({ min: 8, max: 20 }).withMessage(messages.ECL023)
            .bail()
            .custom((value, { req }) => {
                if (eastasianwidth.isStringContainsFullWidth(value)) {
                    return Promise.reject(messages.ECL004('Password'));
                }
                return Promise.resolve(true);
            })
            .bail()
            .trim(),
        body('retype')
            .optional({ checkFalsy: true })
            .not()
            .isEmpty().withMessage(messages.ECL001('Password Confirmation'))
            .bail()
            .isLength({ min: 8, max: 20 }).withMessage(messages.ECL023)
            .bail()
            .custom((value, { req }) => {
                if (eastasianwidth.isStringContainsFullWidth(value)) {
                    return Promise.reject(messages.ECL004('Password Confirmation'));
                }
                return Promise.resolve(true);
            })
            .bail()
            .custom((value, { req }) => {
                return value === req.body.password;
            }).withMessage(messages.ECL030)
            .trim()
    ];

    return ruleArr;
};

const extractErrors = (req: Request) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return [];
    }
    const extractedErrors: ({ [s: string]: unknown; } | ArrayLike<unknown>)[] = [];
    errors.array().forEach(err => {
        extractedErrors.push({ [err.param]: err.msg });
    });
    return extractedErrors;
};
/**
 * 
 * @returns if no error then call next() else redirect to the same page (GET) with flash message and dataBack
 */
export const expressValidateUser = (req: Request, res: Response, next: NextFunction) => {
    const errorsList = extractErrors(req);
    if (errorsList.length === 0) {
        return next();
    }
    // return res.status(422).json({ errors: extractedErrors });
    req.flash('message', Object.values(errorsList[0]))[0]; // get first value of the first object element in the array
    req.flash('dataBack', req.body); // return req.body data back to front-end
    res.redirect(req.originalUrl);
};

export const apiValidateUser = (req: Request, res: Response, next: NextFunction) => {
    const errorsList = extractErrors(req);
    if (errorsList.length === 0) {
        return next();
    }
    res.status(400).json({ messages: errorsList.map((err) => Object.values(err)), status: 400 });
}

