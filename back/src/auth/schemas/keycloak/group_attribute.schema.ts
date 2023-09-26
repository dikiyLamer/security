import { Entity, Column, PrimaryColumn } from "typeorm"


@Entity()
export class group_attribute{
    @PrimaryColumn("varchar", {length: 36})
    id

    @Column("varchar", {length: 255, nullable: true})
    name

    @Column("varchar", {length: 255, nullable: true})
    value

    @Column("varchar", {length: 36})
    group_id

}