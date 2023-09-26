import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"


@Entity()
export class Microservice{
    @PrimaryColumn("varchar", {length: 36})
    uid

    @Column("varchar", {length: 255})
    name
    
    @Column("varchar", {length: 255})
    route

}