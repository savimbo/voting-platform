
import { Column, PrimaryColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UniversalStatusEntity } from "status/entities/universal_status.entity";
import { LangEntity } from "localization/entities/lang.entity";

@Entity("universal_status_tx")
export class UniversalStatusTxEntity {
    @PrimaryColumn()
    status_id: number;

    @PrimaryColumn({ type: 'text', name: 'lang_id'})
    lang_id: string;

    @Column()
    name: string;

    @ManyToOne(() => UniversalStatusEntity, (status) => status.tx)
    @JoinColumn({ name: 'status_id', referencedColumnName: 'id' })
    status?: UniversalStatusEntity;    

    @ManyToOne(() => LangEntity)
    @JoinColumn({ name: 'lang_id', referencedColumnName: 'code_3letter' })
    lang?: LangEntity;
}
