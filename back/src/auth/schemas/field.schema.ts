import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class Field{

    @PrimaryGeneratedColumn()
    id: string

    @PrimaryColumn()
    uid: string

    @Column()
    columns: string

    @Column()
    rule_id: string

    @Column()
    resource_id: string
}