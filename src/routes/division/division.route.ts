import divisionController from '../../controllers/division/division.controller';
import express from 'express';

import { allowOnlyGeDi } from '../../middlewares/screenPermission';
const divisionRouter = express.Router();

// base path: /admin/divisions/
divisionRouter.get('/list', allowOnlyGeDi({ resAsApi: false }), divisionController.listPage);

export default divisionRouter;