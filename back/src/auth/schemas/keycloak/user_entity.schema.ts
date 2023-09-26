import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"


@Entity()
export class user_entity{
    @PrimaryColumn("varchar", {length: 36})
    id

    @Column("varchar", {length: 255, nullable: true})
    email

    @Column("varchar", {length: 255, nullable: true})
    email_constraint

    @Column()
    email_verified: boolean

    @Column()
    enabled: boolean

    @Column("varchar", {length: 255, nullable: true})
    federation_link

    @Column("varchar", {length: 255, nullable: true})
    first_name

    @Column("varchar", {length: 255, nullable: true})
    last_name

    @Column("varchar", {length: 255, nullable: true})
    realm_id

    @Column("varchar", {length: 255, nullable: true})
    username

    @Column("bigint")
    created_timestamp

    @Column("varchar", {length: 255, nullable: true})
    service_account_client_link

    @Column({nullable: true})
    not_before: number

}