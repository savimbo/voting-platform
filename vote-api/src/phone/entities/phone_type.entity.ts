import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn, OneToMany, Index } from "typeorm";
import { PhoneTypeTxEntity } from "./phone_type_tx.entity";

@Entity("phone_type")
export class PhoneTypeEntity {
    @PrimaryColumn({ type: 'text' })
    uid: string;

    @Column()
    id: number;

    @OneToMany(() => PhoneTypeTxEntity, (phone_type_tx) => phone_type_tx.phone_type)
    tx?: PhoneTypeTxEntity[]

}
