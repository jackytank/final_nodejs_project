import express from 'express';
import divisionApiController from '../../controllers/api/division/division.api.controller';

const divisionApiRouter = express.Router();

// base path: /api/admin/divisions/
divisionApiRouter.get('/', divisionApiController.getAll);
divisionApiRouter.get('/search', divisionApiController.search)

export default divisionApiRouter;