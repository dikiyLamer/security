import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"


@Entity()
export class keycloak_role{
    @PrimaryColumn("varchar", {length: 36})
    id

    @Column("varchar", {length: 255, nullable: true})
    client_realm_constraint

    @Column()
    client_role: boolean

    @Column("varchar", {length: 255, nullable: true})
    description

    @Column("varchar", {length: 255, nullable: true})
    name

    @Column("varchar", {length: 255, nullable: true})
    realm_id

    @Column("varchar", {length: 36, nullable: true})
    client

    @Column("varchar", {length: 36, nullable: true})
    realm

    

}