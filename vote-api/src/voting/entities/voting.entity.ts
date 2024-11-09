import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ItemVotingEntity } from "./item_voting.entity";
import { UniversalStatusEntity } from "status/entities/universal_status.entity";

@Entity("voting")
export class VotingEntity {

    @PrimaryColumn()
    id: string;

    @Column()
    name_voting: string;

    @Column()
    description_voting: string
    
    @Column({ nullable: true })
    updated_by: string;

    @Column({ nullable: true })
    created_by: string;

    @CreateDateColumn({ name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({name: "updated_at" })
    updated_at: Date;

    @Column({ nullable: true })
    active_at: Date;

    @Column({ nullable: true })
    closed_at: Date;

    @Column({ nullable: true })
    closed_due_at: Date;

    @Column({ nullable: true })
    final_result: number;

    @OneToMany(() => ItemVotingEntity, item => item.vote) 
    items: ItemVotingEntity[];

    @Column({ type: 'text', nullable: true })
    status_id:number;

    @ManyToOne(() => UniversalStatusEntity)
    @JoinColumn({ name: 'status_id', referencedColumnName: 'id' })
    status?: UniversalStatusEntity;

    @Column({ type: 'text', nullable: true })
    note_voting?:string
}
