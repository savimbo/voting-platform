import { UniversalStatusEntity } from "status/entities/universal_status.entity";
import { UniversalStatus } from "status/model/universal_status.class";
import { Column, CreateDateColumn, Generated, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { SavimboUid } from "util/savimbo-uids";

@Entity("legal_entity")
export class LegalEntityEntity {
    @PrimaryColumn({ type: 'text' })
    id: string;

    @Column({ nullable: false })
    personality: string;  // "user" 

    @Column()
    @Generated("uuid")
    uid: string;

    @Column()
    status_id: number;

    @ManyToOne(() => UniversalStatusEntity)
    @JoinColumn({ name: 'status_id', referencedColumnName: 'id' })
    status: UniversalStatusEntity;

    @Column({ nullable: true })
    default_money_account: string;

    public static createUserLegalEntity(status: UniversalStatus): LegalEntityEntity {
        const legal = new LegalEntityEntity();
        legal.id = SavimboUid.generate();
        legal.personality = "user";
        legal.status_id = status;
        return legal;
    }

}
