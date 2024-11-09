
import { LegalEntityEntity } from "legal_entity/entities/legal_entity.entity";
import { UniversalStatusEntity } from "status/entities/universal_status.entity";
import { ChildEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import { OrgIncomeEntity, UserIncomeEntity } from "./income.entity";

@Entity("payout")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class PayoutEntity {  
    @PrimaryColumn()
    id: string;

    @Column('numeric', { precision: 10, scale: 3 })  // scale 3 because some currencies have 3 decimal places
    amount: string;

    @Column()
    currency: string;  // ISO 4217 3 letter code

    @Column({ nullable: true })
    updated_by: string;

    @Column({ nullable: true })
    created_by: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at" })
    updatedAt: Date;

    @Column({ name: "due_at", nullable: true })
    dueAt: Date | null;

    @Column({ name: "completed_at", nullable: true })
    completedAt: Date | null;

    @Column({ type: 'text', nullable: true }) // payment platform result
    result: string;

    @ManyToOne(() => LegalEntityEntity)
    @JoinColumn({ name: 'recipient_id', referencedColumnName: 'id' })
    recipient: LegalEntityEntity;

    @Column({nullable: true})
    moneyAccount: string | null;

    @ManyToOne(() => UniversalStatusEntity) 
    @JoinColumn({ name: 'status_id', referencedColumnName: 'id' })
    status: UniversalStatusEntity;

}


@ChildEntity()
export class UserPayoutEntity extends PayoutEntity {
    @ManyToMany(() => UserIncomeEntity, (income) => income.user_payouts,  { nullable: true })
    user_incomes?: UserIncomeEntity[] | null
}

@ChildEntity()
export class OrgPayoutEntity extends PayoutEntity {
    OrgIncomeEntity
    @ManyToMany(() => OrgIncomeEntity, (income) => income.org_payouts,  { nullable: true })
    org_incomes?: OrgIncomeEntity[] | null
}