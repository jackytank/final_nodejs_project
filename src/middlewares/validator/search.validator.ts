import { NextFunction, Request, Response } from "express";
import { blackListWords } from "../../constants";
import * as logger from '../../utils/logger';

export const sanitizeSearchQuery = (req: Request, res: Response, next: NextFunction) => {
    const queries = Object.values(req.query);
    const isBlackListed = queries.some((query) => {
        return blackListWords.some((word) => {
            return decodeURIComponent(query as string).toLowerCase().includes(word);
        });
    });
    if (isBlackListed) {
        logger.logWarning(req, `Bad request, search query contains malicious words: ${queries}`);
        return res.status(400).json({ message: 'Bad request, search query contains malicious words' });
    }
    next();
};