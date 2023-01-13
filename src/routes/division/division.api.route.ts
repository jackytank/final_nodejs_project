import express from 'express';
import divisionApiController from '../../controllers/api/division/division.api.controller';
import { uploadFile } from '../../middlewares/uploadCsv';

const divisionApiRouter = express.Router();

// base path: /api/admin/divisions/
divisionApiRouter.get('/', divisionApiController.getAll);
divisionApiRouter.get('/search', divisionApiController.search)
divisionApiRouter.post('/csv/import', uploadFile.single('file'), divisionApiController.importCsv);

export default divisionApiRouter;