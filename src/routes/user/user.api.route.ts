import { sanitizeSearchQuery } from './../../middlewares/validator/search.validator';
import express from 'express';
import UserApiController from '../../controllers/api/user/user.api.controller';
import { allowParams, allowOnlyGeDi } from '../../middlewares/screenPermission';
import { uploadFile } from '../../middlewares/uploadCsv';
import { apiLimiter } from '../../utils/rateLimiter';
const userApiRouter = express.Router();

// base path: /api/admin/users/
userApiRouter.get('/', UserApiController.getAll);
userApiRouter.get('/search', sanitizeSearchQuery, UserApiController.search);
userApiRouter.get('/:id', UserApiController.getOne);
userApiRouter.post('/', allowOnlyGeDi({ resAsApi: true }), UserApiController.save);
userApiRouter.put('/:id', allowParams({ resAsApi: true }), UserApiController.update);
userApiRouter.delete('/:id', allowParams({ resAsApi: true }), UserApiController.remove);
userApiRouter.post('/csv/import', uploadFile.single('file'), UserApiController.importCsv);
userApiRouter.get('/csv/export', allowOnlyGeDi({ resAsApi: true }), UserApiController.exportCsv);
userApiRouter.post('/csv/export', allowOnlyGeDi({ resAsApi: true }), UserApiController.exportCsv);

export default userApiRouter;
