import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { VotingEntity } from "./voting.entity";

@Entity("item_voting")
export class ItemVotingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    vendor: string;

    @Column()
    description: string;

    @Column({ type: 'float', scale: 2 })
    quantity: number;
    
    @Column({ type: 'float', scale: 2  })
    rate: number;

    @Column({ type: 'float', scale: 2  })
    amount: number;

    @Column({nullable: true })
    vote_id: string;

    @ManyToOne(() => VotingEntity, vote => vote.items)
    @JoinColumn({ name: 'vote_id' })
    vote?: VotingEntity;
}
