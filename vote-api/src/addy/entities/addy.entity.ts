
import { CountryEntity } from "localization/entities/country.entity";
import { StateEntity } from "localization/entities/state.entity";
import { Column, CreateDateColumn, Generated, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne } from "typeorm";


@Entity("addy")
export class AddyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    formatted_address: string;

    @Column({ nullable: true })
    fuzzy_address: string;

    @Column({ nullable: true })
    street: string;

    @Column({ nullable: true })
    extended: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    postal_code: string;

    @Column({ type: 'text', nullable: true  })
    state_code: string;

    @Column({  type: 'text', nullable: true  } )
    country_code: string;

    @Column({ nullable: true })
    google_place_id: string;

    @Column({ nullable: true })
    google_place_type: string;

    @Column({ nullable: true })
    google_plus_code: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column({ nullable: true })
    created_by?: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at" })
    updatedAt: Date;

    @ManyToOne(() => StateEntity)
    @JoinColumn({ name: 'state_code', referencedColumnName: 'code' })
    state?: StateEntity; 
    //state: Promise<StateEntity>; 

    @ManyToOne(() => CountryEntity)
    @JoinColumn({ name: 'country_code', referencedColumnName: 'code_alpha3' })
    country?: CountryEntity; 
    //country: Promise<CountryEntity>; 
    
}
