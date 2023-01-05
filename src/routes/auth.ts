/**
 * Login Router
 */
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { loginLimiter } from '../utils/rateLimiter';

const authRouter = Router();

authRouter.get('/login', authController.login);
authRouter.post('/login', authController.auth);
authRouter.get('/logout', authController.logout);

export default authRouter;
