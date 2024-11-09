import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("voting_option")
export class VotingOptionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
