
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, UpdateDateColumn, OneToOne, PrimaryColumn } from "typeorm";
import { AuthenticationSystem, authenticationSystemTransformer } from "../../auth/dto/authentication-system"
import { LangEntity } from 'localization/entities/lang.entity';
import { AddyEntity } from 'addy/entities/addy.entity';
import { LegalEntityEntity } from 'legal_entity/entities/legal_entity.entity';
import { GlobalRoleEntity } from 'permission/entities/global_role.entity';


@Entity("users")
export class UserEntity {
    @PrimaryColumn({ type: 'text' })
    id: string;

    @Column({unique: true, nullable: false })
    email: string;

    @Column()
    name_legal_first: string;

    @Column()
    name_legal_last: string;

    @Column({ nullable: true })
    name_display_first: string;

    @Column({ nullable: true })
    name_display_last: string;

    @Column({ nullable: true })
    icon_url: string;

    @Column({ nullable: true })
    big_icon_url: string;

    @Column({type: 'smallint', transformer: authenticationSystemTransformer, nullable: false })
    authSystem : AuthenticationSystem;

    @Column({ nullable: true })
    pwdhas: string;

    @Column({ nullable: true })
    pwdsalt?: string;

    @Column({ type: 'boolean', default: false })
    flagged_by_staff: boolean;

    @Column({ nullable: true })
    updated_by: string;

    @Column({ nullable: true })
    created_by: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at" })
    updatedAt: Date;

    @Column({ name: 'lang_id', nullable: true })
    lang_id: string;

    @ManyToOne(() => LangEntity)
    @JoinColumn({ name: 'lang_id', referencedColumnName: 'code_3letter' })
    lang: LangEntity;

    @OneToOne(() => AddyEntity)
    @JoinColumn({ name: 'addy_id', referencedColumnName: 'id' })
    addy: AddyEntity

    @OneToOne(() => LegalEntityEntity)
    @JoinColumn({ name: 'legal_entity_id', referencedColumnName: 'id' })
    legalEntity: LegalEntityEntity

    @ManyToMany(() => GlobalRoleEntity)
    @JoinTable({ name: "users_global_role" })
    roles: GlobalRoleEntity[];

}
