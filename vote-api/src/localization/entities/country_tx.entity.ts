
import { Column, PrimaryColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { CountryEntity } from "./country.entity";
import { LangEntity } from "./lang.entity";

@Entity("country_tx")
export class CountryTxEntity {
    @PrimaryColumn({ name: 'country_code_alpha3', type: 'text' })
    country_code_alpha3: string;

    @PrimaryColumn({ type: 'text' })
    lang_id: string;

    @Column()
    name: string;


    // This is necessary to indicate that country_id_0 is a foreign key
    @ManyToOne(() => CountryEntity, (country) => country.tx)
    @JoinColumn({ name: 'country_code_alpha3', referencedColumnName: 'code_alpha3' })
    country?: CountryEntity;    

     // This is necessary to indicate that lang_id_0 is a foreign key
     @ManyToOne(() => LangEntity)
     @JoinColumn({ name: 'lang_id', referencedColumnName: 'code_3letter' })
     lang?: LangEntity;    
}
