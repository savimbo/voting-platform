import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn, OneToMany } from "typeorm";
import { LangTxEntity } from "./lang_tx.entity";

@Entity("lang")
export class LangEntity {
    @PrimaryColumn({ type: 'text' })
    code_3letter: string;

    @Column()
    id: number

    @Column({ unique: true })
    code_2letter: string;

    @Column()
    fallback_lang_id: string

    @Column()
    google_code: number;

    @Column()
    flag_staff: boolean;

    @OneToMany(() => LangTxEntity, (lang_tx) => lang_tx.lang_id_0)
    tx?: LangTxEntity[]

}
