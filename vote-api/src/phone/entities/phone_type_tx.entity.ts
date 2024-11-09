
import { Column, PrimaryColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { PhoneTypeEntity } from "./phone_type.entity";
import { LangEntity } from "localization/entities/lang.entity";

@Entity("phone_type_tx")
export class PhoneTypeTxEntity {
    @PrimaryColumn({ type: 'text', name: 'phone_type_uid'})
    phone_type_uid: string;

    @PrimaryColumn({ type: 'text', name: 'lang_id'})
    lang_id: string;

    @Column()
    name: string;

    // This is necessary to indicate that lang_id_0 is a foreign key, even if we are not going to fill the object and the id numeric column is enough
    @ManyToOne(() => PhoneTypeEntity, (phone_type) => phone_type.tx)
    @JoinColumn({ name: 'phone_type_uid', referencedColumnName: 'uid' })
    phone_type?: PhoneTypeEntity;    

    @ManyToOne(() => LangEntity)
    @JoinColumn({ name: 'lang_id', referencedColumnName: 'code_3letter' })
    lang?: LangEntity;
}
