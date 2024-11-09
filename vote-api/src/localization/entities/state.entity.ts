
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn, OneToMany, ManyToOne } from "typeorm";
import { StateTxEntity } from "./state_tx.entity";
import { CountryEntity } from "./country.entity";


@Entity("state")
export class StateEntity {
    @PrimaryColumn({ type: 'text' })
    code: string;

    @Column({ type: 'text' })
    country_code_alpha3: string;

    @Column()
    code_subdivision: string;

    @Column({ unique: true })
    state_id: number

    @Column({ nullable: true })
    google_place_id?: string;

    @OneToMany(() => StateTxEntity, (state_tx) => state_tx.state)
    tx?: StateTxEntity[]

    @ManyToOne(() => CountryEntity)
    @JoinColumn({ name: 'country_code_alpha3', referencedColumnName: 'code_alpha3' })
    country?: CountryEntity; 

}
