import { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { titleMessageError } from "../constants";
import logger from "../winston";

const FOR_PAGE = {
    API: {
        window: 15 * 60 * 1000, // 15 minutes
        max: 3,
        get message() { return `You have reached the max ${this.max} number of api requests. Please try again later after 15 minutes.`; },
    },
    LOGIN: {
        window: 60 * 60 * 1000, // 1 hour
        max: 25,
        get message() { return `You have reached the max ${this.max} number of login requests. Please try again later after 15 minutes.`; },
    },
    REGISTER: {
        window: 60 * 60 * 1000, // 1 hour
        max: 5,
        get message() { return `You have reached the max ${this.max} number of account creation requests. Please try again later after 1 hour.`; },
    }
};

export const apiLimiter = rateLimit({
    windowMs: FOR_PAGE.API.window,
    max: FOR_PAGE.API.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: FOR_PAGE.API.message,
    handler: (req: Request, res: Response, next: NextFunction, options) => {
        logger.warn(`[RateLimiter] ${req.ip} - ${req.method} - ${req.originalUrl} - ${options.message}`);
        res.status(429).json({ status: options.statusCode, message: options.message });
    }
});

export const createUserLimiter = rateLimit({
    windowMs: FOR_PAGE.REGISTER.window,
    max: FOR_PAGE.REGISTER.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: FOR_PAGE.REGISTER.message,
    handler: (req: Request, res: Response, next: NextFunction, options) => {
        logger.warn(`[RateLimiter] ${req.ip} - ${req.method} - ${req.originalUrl} - ${options.message}`);
        res.render('errors/index', {
            layout: 'layout/noLoginLayout',
            title: titleMessageError.LIMIT_REQUEST,
            content: options.message,
        });
    }
});
export const loginLimiter = rateLimit({
    windowMs: FOR_PAGE.LOGIN.window,
    max: FOR_PAGE.LOGIN.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: FOR_PAGE.LOGIN.message,
    handler: (req: Request, res: Response, next: NextFunction, options) => {
        logger.warn(`[RateLimiter] ${req.ip} - ${req.method} - ${req.originalUrl} - ${options.message}`);
        res.render('errors/index', {
            layout: 'layout/noLoginLayout',
            title: titleMessageError.LIMIT_REQUEST,
            content: options.message,
        });
    }
});