import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"


@Entity()
export class ResourceRule{
    @PrimaryColumn("varchar", {length: 36})
    uid

    @Column("varchar", {length: 36})
    resource_id

    @Column("varchar", {length: 36})
    rule_id

    @Column("varchar", {length: 255})
    attribute

    @Column("varchar", {length: 64})
    operator

    @Column("varchar", {length: 255})
    value

}