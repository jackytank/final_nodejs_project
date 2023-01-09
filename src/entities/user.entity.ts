import { Division } from './division.entity';
import { Base } from './base';
import { Entity, Column, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty, MaxLength, MinLength, IsOptional, IsNotIn, IsIn } from "class-validator";
import { errMsg } from '../constants';

export enum PosEnum {
  GE_DI = 0,
  GR_LE = 1,
  LE = 2,
  MEM = 3,
}

/**
 * Model definition
 */
@Entity({
  name: 'user',
  synchronize: false,
  orderBy: {
    id: 'ASC',
  },
})
export class User extends Base {

  @Column({ name: 'email', type: "varchar", length: 255, nullable: false })
  @IsEmail({}, { message: errMsg.ERR003('email') })
  email!: string;

  @Column({ name: 'password', type: "varchar", length: 255, nullable: false })
  @IsOptional()
  @MinLength(8, { message: errMsg.ERR005('password', 8) })
  @MaxLength(20, { message: errMsg.ERR006('password', 20) })
  password!: string;

  @Column({ name: 'name', type: "varchar", length: 50, nullable: false })
  @IsNotEmpty({
    message: errMsg.ERR001('name')
  })
  @MaxLength(100, {
    message: errMsg.ERR006('name', 50)
  })
  name!: string;

  @Column({ name: 'division_id', type: 'bigint', nullable: false })
  @IsNotEmpty({
    message: errMsg.ERR001('division_id')
  })
  division_id!: number;

  @Column({ name: 'entered_date', type: 'date', nullable: false })
  entered_date: Date;

  @Column({ name: 'position_id', type: 'bigint', nullable: false })
  // Ex: [1, 2, 3, '1', '2', '3']
  @IsIn(Object.values(PosEnum).concat(Object.values(PosEnum).map((n) => n + "")),
    { message: errMsg.ERR003('position_id') })
  position_id!: number; // 0: General Director, 1: Group Leader, 2: Leader, 3: Member

  // @OneToMany(type => Division, division => division.users)
  // divisions: Division[];
}

