import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("database_version")
export class DatabaseVersionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    major: number;

    @Column()
    minor: number;

    @Column()
    revision: number;

    
}
