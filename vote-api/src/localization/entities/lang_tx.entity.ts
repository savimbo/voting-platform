
import { Column, PrimaryColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { LangEntity } from "./lang.entity";

@Entity("lang_tx")
export class LangTxEntity {
    @PrimaryColumn({ name: 'lang_id_0', type: 'text' })
    lang_id_0: string;

    @PrimaryColumn({ type: 'text' })
    lang_id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    note_staff: string;

    // This is necessary to indicate that lang_id_0 is a foreign key
    @ManyToOne(() => LangEntity)
    @JoinColumn({ name: 'lang_id_0', referencedColumnName: 'code_3letter' })
    lang?: LangEntity;    
}
