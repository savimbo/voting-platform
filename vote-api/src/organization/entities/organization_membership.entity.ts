import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { EntityRoleEntity } from "permission/entities/entity_permission.entity";
import { LegalEntityEntity } from "legal_entity/entities/legal_entity.entity";

@Entity("organization_membership")
export class OrganizationMembershipEntity {
    @PrimaryColumn({ type: 'text' })
    id?: string;

    @Column({ type: 'text' })
    legalEntity_id: string;

    @ManyToOne(() => LegalEntityEntity)
    @JoinColumn({ name: 'legalEntity_id', referencedColumnName: 'id' })
    legalEntity: LegalEntityEntity;

    @ManyToMany(() => EntityRoleEntity)
    @JoinTable({ name: "org_membership_entity_role" })
    roles: EntityRoleEntity[]

}
