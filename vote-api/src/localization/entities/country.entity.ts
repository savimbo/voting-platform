
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn, OneToMany } from "typeorm";
import { CountryTxEntity } from "./country_tx.entity";
import { CountryCallingCodeEntity } from "./country_calling_code.entity";

@Entity("country")
export class CountryEntity {
    @PrimaryColumn({ type: 'text' })
    code_alpha3: string;

    @Column()
    code_alpha2: string;

    @Column()
    country_id: number

    @Column()
    code_numeric: number

    @Column({ nullable: true })
    google_place_id?: string;

    @Column()
    national_flag_char: string;


    @OneToMany(() => CountryTxEntity, (country_tx) => country_tx.country)
    tx?: CountryTxEntity[]

    @OneToMany(() => CountryCallingCodeEntity, (calling_code) => calling_code.country)
    calling_codes?: CountryCallingCodeEntity[]

}
