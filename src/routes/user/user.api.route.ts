import { sanitizeSearchQuery } from './../../middlewares/validator/search.validator';
import express from 'express';
import UserApiController from '../../controllers/api/user/user.api.controller';
import { allowParams, allowOnlyGeDi } from '../../middlewares/screenPermission';
import { uploadFile } from '../../middlewares/uploadCsv';
import { apiLimiter } from '../../utils/rateLimiter';
import { userExpressValidationRule, expressValidateUser, apiValidateUser } from '../../middlewares/validator/user/user.validator';
const userApiRouter = express.Router();

// base path: /api/admin/users/
userApiRouter.get('/', allowOnlyGeDi({ resAsApi: true }), UserApiController.getAll);
userApiRouter.get('/search', sanitizeSearchQuery, UserApiController.search);
// userApiRouter.get('/:id', UserApiController.getOne);
userApiRouter.post('/', allowOnlyGeDi({ resAsApi: true }), userExpressValidationRule({ hasRetype: true, hasPass: true, passAndRetypeOptional: false }), apiValidateUser, UserApiController.save);
userApiRouter.put('/:id', userExpressValidationRule({ hasRetype: true, hasPass: true, passAndRetypeOptional: true }), apiValidateUser, UserApiController.update);
userApiRouter.delete('/:id', allowOnlyGeDi({ resAsApi: true }), UserApiController.remove);
// userApiRouter.post('/csv/import', uploadFile.single('file'), UserApiController.importCsv);
userApiRouter.get('/csv/export', allowOnlyGeDi({ resAsApi: true }), UserApiController.exportCsv);
userApiRouter.post('/csv/export', allowOnlyGeDi({ resAsApi: true }), UserApiController.exportCsv);

export default userApiRouter;
