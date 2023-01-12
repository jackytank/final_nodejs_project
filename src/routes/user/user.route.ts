import express from 'express';
import AdminUserController from '../../controllers/user/user.controller';
import { allowOnlyGeDi, allowBoth } from '../../middlewares/screenPermission';
import { expressValidateUser, userExpressValidationRule } from '../../middlewares/validator/user/user.validator';
import { createUserLimiter } from '../../utils/rateLimiter';
const userRouter = express.Router();

// check permission for all routes
userRouter.use('/edit/:id', allowOnlyGeDi({ resAsApi: false }));
userRouter.use('/addPage', allowOnlyGeDi({ resAsApi: false }));

// base path: /admin/users/
userRouter.get('/addPage', AdminUserController.addPage);
userRouter.post('/addPage', userExpressValidationRule({ hasRetype: true, hasPass: true, passAndRetypeOptional: false }), expressValidateUser, AdminUserController.createNewUser); // add middleware for validate req.body and is exist username, email
userRouter.get('/edit/:id', AdminUserController.editPage);
// userRouter.post('/edit/:id', userExpressValidationRule({ hasRetype: false, hasPass: false }), expressValidateUser, AdminUserController.update);
userRouter.get('/list', AdminUserController.listPage);

export default userRouter;