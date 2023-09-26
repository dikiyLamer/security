import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"


@Entity()
export class user_role_mapping{

    @PrimaryColumn("varchar", {length: 255})
    role_id

    @PrimaryColumn("varchar", {length: 36})
    user_id


}