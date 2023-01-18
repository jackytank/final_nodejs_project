/**
 * Main Router
 */
import { Router } from 'express';
import { notFound as notFoundHandler } from '../controllers/error.controller';
import sessionMiddleWare from '../middlewares/session';
import userMiddleware from '../middlewares/user';
import authRouter from './auth';
import viewHelper from '../middlewares/viewHelper';
import userRouter from './user/user.route';
import divisionRouter from './division/division.route';
import userApiRouter from './user/user.api.route';
import { noCache } from '../middlewares/noCache';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authentication, authentication_jwt } from '../middlewares/authentication';
import divisionApiRouter from './division/division.api.route';
const router = Router();

// router.use(sessionMiddleWare);
router.use(userMiddleware);
router.use(noCache); // disable cache to prevent back button issue after logout
router.use('/', authRouter);
router.use(authentication_jwt);
router.use(viewHelper);

router.get('/', (req, res) => {
    const flashMessage = req.flash('message')[0];
    req.flash('message', flashMessage);
    res.redirect('/admin/users/list');
});

router.use('/admin/users', userRouter);
router.use('/admin/divisions', divisionRouter);
router.use('/api/admin/users', userApiRouter);
router.use('/api/admin/divisions', divisionApiRouter);

// 404 error
router.use(notFoundHandler);

export default router;
