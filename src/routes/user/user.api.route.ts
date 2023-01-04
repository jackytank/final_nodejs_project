import { sanitizeSearchQuery } from './../../middlewares/validator/search.validator';
import express from 'express';
import AdminUserApiController from '../../controllers/api/admin/user/admin-user.api.controller';
import { allowParams, defaultAllow } from '../../middlewares/screenPermission';
import { uploadFile } from '../../middlewares/uploadCsv';
import { apiLimiter } from '../../utils/rateLimiter';
const adminUserApiRouter = express.Router();

// base path: /api/admin/users/
adminUserApiRouter.get('/', AdminUserApiController.getAll);
adminUserApiRouter.get('/search', sanitizeSearchQuery, AdminUserApiController.search);
adminUserApiRouter.get('/:id', AdminUserApiController.getOne);
adminUserApiRouter.post('/', defaultAllow({ resAsApi: true }), AdminUserApiController.save);
adminUserApiRouter.put('/:id', allowParams({ resAsApi: true }), AdminUserApiController.update);
adminUserApiRouter.delete('/:id', allowParams({ resAsApi: true }), AdminUserApiController.remove);
adminUserApiRouter.post('/csv/import', uploadFile.single('file'), AdminUserApiController.importCsv);
adminUserApiRouter.get('/csv/export', AdminUserApiController.exportCsv);
adminUserApiRouter.post('/csv/export', AdminUserApiController.exportCsv);

export default adminUserApiRouter;
