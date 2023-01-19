import { messages } from './../constants';
import { Base } from './base';
import { Entity, Column, ManyToOne } from "typeorm";
import { User } from './user.entity';
import { IsInt, IsNotEmpty, IsNumber, IsNumberString, MaxLength, ValidationArguments } from 'class-validator';
import { CustomIsStringNumber, IsAll1Bytes } from '../middlewares/validator/division/division.validator';


/**
 * Model definition
 * Remember: validation run from lower to upper, ex: @IsEmpty @IsNull @IsCool -> @IsCool run first, then @IsNull , finally @IsEmpty
 */
@Entity({
    name: 'division',
    synchronize: false,
    orderBy: {
        id: 'ASC',
    },
})
export class Division extends Base {
    @Column({ name: 'name', type: "varchar", length: 255, nullable: false })
    @MaxLength(255, {
        message: (args: ValidationArguments) => {
            if (parseInt(args.value.length) > 255) {
                return messages.ECL002('Division Name', args.constraints[0] as number, args.value.length as number);
            }
            return '';
        }
    })
    // @IsAll1Bytes({
    //     message: messages.ECL004('Division Name')
    // })
    @IsNotEmpty({
        message: messages.ECL001('Division Name')
    })
    name!: string;

    @Column({ name: 'note', type: "text", nullable: true })
    // @IsAll1Bytes({
    //     message: messages.ECL004('Division Note')
    // })
    note!: string;

    @Column({ name: 'division_leader_id', type: 'bigint', nullable: false })
    @CustomIsStringNumber({
        message: messages.ECL010('Division Leader')
    })
    @IsNotEmpty({
        message: messages.ECL001('Division Leader')
    })
    division_leader_id!: number;

    @Column({ name: 'division_floor_num', type: 'int', nullable: false })
    @CustomIsStringNumber({
        message: messages.ECL010('Floor Number')
    })
    @IsNotEmpty({
        message: messages.ECL001('Floor Number')
    })
    division_floor_num!: number;

    // @ManyToOne(type => User, user => user.divisions)
    // users: User[];

}
