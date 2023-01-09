import { AppDataSource } from "../../DataSource";
import { Division } from "../../entities/division.entity";
import { DivisionService } from "../../services/division/division.service";
import { Request, Response } from "express";

class DivisionController {
    private disRepo = AppDataSource.getRepository(Division);
    private disService = new DivisionService();

    constructor() {
        this.listPage = this.listPage.bind(this);
    }

    // GET
    async listPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('admin/divisions/list', {
            activeTab: 'listDivisionTab',
            queryBack: {},
            message: flashMessage,
        });
    }
}

export default new DivisionController();