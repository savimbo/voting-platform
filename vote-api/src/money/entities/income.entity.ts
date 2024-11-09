import { LegalEntityEntity } from "legal_entity/entities/legal_entity.entity";
import { ChildEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from "typeorm";
import { OrgPayoutEntity, UserPayoutEntity } from "./payout.entity";

@Entity("beneficiary_income")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class BeneficiaryIncomeEntity {  // Concrete Table Inheritance
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

    @ManyToOne(() => LegalEntityEntity)
    @JoinColumn({ name: 'recipient_id', referencedColumnName: 'id' })
    recipient: LegalEntityEntity;

    @ManyToOne(() => LegalEntityEntity, { nullable: true }) 
    @JoinColumn({ name: 'disburser_id', referencedColumnName: 'id' })
    disburser: LegalEntityEntity | null;

    @Column({ type: 'text', nullable: true })
    description: string;
}

@ChildEntity()
export class UserIncomeEntity extends BeneficiaryIncomeEntity {
    @ManyToMany(() => UserPayoutEntity, (payout) => payout.user_incomes, { nullable: true })
    @JoinTable({ name: "user_payment",
        joinColumn: {
            name: "income_id", referencedColumnName: "id" 
        },
        inverseJoinColumn: {
            name: "payout_id", referencedColumnName: "id" 
        }
     })
    user_payouts?: UserPayoutEntity[] | null
}

@ChildEntity()
export class OrgIncomeEntity extends BeneficiaryIncomeEntity {
    @ManyToMany(() => OrgPayoutEntity, (payout) => payout.org_incomes, { nullable: true })
    @JoinTable({ name: "org_payment",
        joinColumn: {
            name: "income_id", referencedColumnName: "id" 
        },
        inverseJoinColumn: {
            name: "payout_id", referencedColumnName: "id" 
        }
     })
    org_payouts?: OrgPayoutEntity[] | null
}