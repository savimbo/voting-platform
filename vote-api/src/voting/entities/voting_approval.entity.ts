import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { VotingOptionEntity } from "./voting_option.entity";
import { UserEntity } from "users/entities/user.entity";
import { VotingEntity } from "./voting.entity";

@Entity("voting_approval")
export class VotingApprovalEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    voting_id: string;

    @Column({ type: 'text' })
    user_id: string;

    @Column()
    option_id: number;
    
    @CreateDateColumn({ name: "created_at" })
    created_at: Date;

    @ManyToOne(() => VotingEntity)
    @JoinColumn({ name: 'voting_id', referencedColumnName: 'id' })
    voting?: VotingEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user?: UserEntity;

    @ManyToOne(() => VotingOptionEntity)
    @JoinColumn({ name: 'option_id', referencedColumnName: 'id' })
    option?: VotingOptionEntity;
}

