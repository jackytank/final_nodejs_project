/**
 * Main Router
 */
import { Router } from 'express';
import { notFound as notFoundHandler } from '../controllers/error.controller';
import sessionMiddleWare from '../middlewares/session';
import userMiddleware from '../middlewares/user';
import authRouter from './auth';
import viewHelper from '../middlewares/viewHelper';
import adminUserRouter from './user/user.route';
import adminUserApiRouter from './user/user.api.route';
import { noCache } from '../middlewares/noCache';
import { authentication } from '../middlewares/authentication';
const router = Router();

router.use(sessionMiddleWare);
router.use(userMiddleware);
router.use(noCache); // disable cache to prevent back button issue after logout
router.use('/', authRouter);
router.use(authentication);
router.use(viewHelper);

router.get('/', (req, res) => {
    const flashMessage = req.flash('message')[0];
    req.flash('message', flashMessage);
    res.redirect('/admin/users/list');
});

router.use('/admin/users', adminUserRouter);
router.use('/api/admin/users', adminUserApiRouter);

// 404 error
router.use(notFoundHandler);

export default router;
