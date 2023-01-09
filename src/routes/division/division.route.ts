import express from 'express';
import adminDivisionController from '../../controllers/admin/division/admin-division.controller';
import { allowOnlyGeDi } from '../../middlewares/screenPermission';
const adminDivisionRouter = express.Router();

// base path: /admin/divisions/
adminDivisionRouter.get('/list', allowOnlyGeDi({ resAsApi: false }), adminDivisionController.listPage);

export default adminDivisionRouter;