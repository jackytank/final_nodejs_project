import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Base {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'created_date', type: 'date', nullable: false })
    @CreateDateColumn()
    created_date: Date;

    @Column({ name: 'updated_date', type: 'date', nullable: false })
    @UpdateDateColumn()
    updated_date: Date;

    @Column({ name: 'deleted_date', type: 'date', nullable: true })
    @DeleteDateColumn()
    deleted_date: Date;
}
