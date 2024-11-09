import { Column, PrimaryColumn, Entity, JoinColumn, ManyToOne } from "typeorm";
import { StateEntity } from "./state.entity";
import { LangEntity } from "./lang.entity";

@Entity("state_tx")
export class StateTxEntity {
    @PrimaryColumn({ name: 'state_code', type: 'text' })
    state_code: string;

    @PrimaryColumn({ type: 'text' })
    lang_id: string;

    @Column()
    name: string;

    @ManyToOne(() => StateEntity, (state) => state.tx)
    @JoinColumn({ name: 'state_code', referencedColumnName: 'code' })
    state?: StateEntity;    

     @ManyToOne(() => LangEntity)
     @JoinColumn({ name: 'lang_id', referencedColumnName: 'code_3letter' })
     lang?: LangEntity;    
}
