import express from 'express';
import divisionApiController from '../../controllers/api/division/division.api.controller';
import { allowOnlyGeDi } from '../../middlewares/screenPermission';
import { uploadFile } from '../../middlewares/uploadCsv';

const divisionApiRouter = express.Router();

// base path: /api/admin/divisions/
divisionApiRouter.get('/', allowOnlyGeDi({ resAsApi: false, redirUrl: '/logout' }), divisionApiController.getAll);
divisionApiRouter.get('/search', allowOnlyGeDi({ resAsApi: false, redirUrl: '/logout' }), divisionApiController.search);
divisionApiRouter.post('/csv/import', allowOnlyGeDi({ resAsApi: false, redirUrl: '/logout' }), uploadFile.single('file'), divisionApiController.importCsv);

export default divisionApiRouter;