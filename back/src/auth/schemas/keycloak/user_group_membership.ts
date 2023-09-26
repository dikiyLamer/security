import { Entity, Column, PrimaryColumn } from "typeorm"


@Entity()
export class user_group_membership{
    @PrimaryColumn("varchar", {length: 36})
    group_id

    @PrimaryColumn("varchar", {length: 36})
    user_id

}