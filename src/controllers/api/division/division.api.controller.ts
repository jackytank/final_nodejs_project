import { Request, Response } from "express";
import { AppDataSource } from "../../../DataSource";
import { Division } from "../../../entities/division.entity";

class DivisionApiController {
    private disRepo = AppDataSource.getRepository(Division);

    constructor() {
        this.getAll = this.getAll.bind(this);
    }

    async getAll(req: Request, res: Response) {
        const data = await this.disRepo.createQueryBuilder('d').where('d.deleted_date IS NULL').getMany();
        return res.status(200).json({ data: data });
    }
}

export default new DivisionApiController();