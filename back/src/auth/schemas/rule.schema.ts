import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"


@Entity()
export class Rule{

    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar", {length: 36, unique: true, nullable: false})
    uid

    @Column("varchar", {length: 255})
    name

    @Column("text", {nullable: true})
    description

    @Column("bigint")
    created_at 

    @Column("varchar", {length: 36})
    type

    @Column("varchar", {length: 255})
    action

}