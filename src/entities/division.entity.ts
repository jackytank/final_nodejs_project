import { Base } from './base';
import { Entity, Column, ManyToOne } from "typeorm";
import { User } from './user.entity';


/**
 * Model definition
 */
@Entity({
    name: 'division',
    synchronize: false,
    orderBy: {
        id: 'DESC',
    },
})
export class Division extends Base {
    @Column({ name: 'name', type: "varchar", length: 255, nullable: false })
    name!: string;

    @Column({ name: 'note', type: "text", nullable: true })
    note!: string;

    @Column({ name: 'division_leader_id', type: 'bigint', nullable: false })
    division_leader_id!: number;

    @Column({ name: 'division_leader_id', type: 'int', nullable: false })
    division_floor_num!: number;

    @ManyToOne(type => User, user => user.divisions)
    users: User[];

}
