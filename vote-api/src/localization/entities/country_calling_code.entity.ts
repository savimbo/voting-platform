import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { CountryEntity } from "./country.entity";

@Entity("country_calling_code")
export class CountryCallingCodeEntity {
    @PrimaryColumn({ type: 'text' })
    code: string;

    @Column()
    code_numeric: number;

    @Column({ type: 'text' })
    country_code_alpha3: string;

    @Column({ unique: true })
    id: number

    @ManyToOne(() => CountryEntity, (country) => country.calling_codes)
    @JoinColumn({ name: 'country_code_alpha3', referencedColumnName: 'code_alpha3' })
    country?: CountryEntity;

}
