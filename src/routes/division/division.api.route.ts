import express from 'express';
import divisionApiController from '../../controllers/api/division/division.api.controller';

const divisionApiRouter = express.Router();

// base path: /api/admin/divisions/
divisionApiRouter.get('/', divisionApiController.getAll);

export default divisionApiRouter;