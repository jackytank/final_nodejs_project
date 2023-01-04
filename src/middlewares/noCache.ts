import { NextFunction, Request, Response } from "express";

export const noCache = (req: Request, res: Response, next: NextFunction) => {
    // to prevent user from using back button to access previous page
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};