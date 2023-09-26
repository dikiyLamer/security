import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, CreateDateColumn } from "typeorm"


@Entity()
export class Resource{
    @PrimaryColumn()
    uid: string

    @Column()
    name: string

    @Column({nullable: true})
    alias: string

    @Column("text", {nullable: true})
    attributes

    @CreateDateColumn()
    created_at: Date

    @Column()
    microservice_id: string

    @Column({nullable: true})
    description: string
}