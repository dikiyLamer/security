import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class ResourceAttribute{
    @PrimaryColumn()
    uid: string

    @Column()
    name: string

    @Column({nullable: true})
    alias: string

    @CreateDateColumn()
    createdDate: Date

    @Column({nullable: true})
    description: string

    @Column()
    resourceUid: string
}