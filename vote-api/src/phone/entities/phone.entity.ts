
import { Column, CreateDateColumn, Generated, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { CountryCallingCodeEntity } from 'localization/entities/country_calling_code.entity';
import { PhoneTypeEntity } from './phone_type.entity';
import { LegalEntityEntity } from "legal_entity/entities/legal_entity.entity";


@Entity("phone")
export class PhoneEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: string;

    @Column()
    number_as_entered: string;

    @Column({ nullable: true })
    extension: string;

    @Column()
    updated_by: string;

    @Column()
    created_by?: string;

    @CreateDateColumn()
    created_at?: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'text' })
    country_calling_code: string;

    //@ManyToOne(() => CountryCallingCodeEntity, (cc) => cc.calling_codes)
    @ManyToOne(() => CountryCallingCodeEntity)
    @JoinColumn({ name: 'country_calling_code', referencedColumnName: 'code' })
    country_calling_code_entity?: CountryCallingCodeEntity;

    @Column({ type: 'text' })
    phone_type_uid: string;

    @ManyToOne(() => PhoneTypeEntity, (phone_type) => phone_type.tx)
    @JoinColumn({ name: 'phone_type_uid', referencedColumnName: 'uid' })
    phone_type?: PhoneTypeEntity;    

    @ManyToMany(() => LegalEntityEntity)
    @JoinTable({name: 'phone_legal_entity'})
    legalEntity: LegalEntityEntity[]
    
}
