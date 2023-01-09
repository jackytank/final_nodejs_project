import { AppDataSource } from "../../DataSource";
import { Division } from "../../entities/division.entity";

export class DivisionService{
    private disRepo = AppDataSource.getRepository(Division);

    
}