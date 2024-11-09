
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { GlobalPermissionEntity } from "./global_permission.entity";



@Entity("entity_with_permissions")
export class EntityWithPermissionsEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;
}


@Entity("entity_permission")
export class EntityPermissionEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    text_id: string;

    @Column()
    entity_id: number;  

    @Column()
    scope: string;

    @ManyToOne(() => EntityWithPermissionsEntity)
    @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
    entity?: EntityWithPermissionsEntity;
}

@Entity("entity_role")
export class EntityRoleEntity {
    @PrimaryColumn({ type: 'text' })
    id?: string;

    @Column()
    name: string;

    @Column()
    description1: string;

    @Column()
    description2: string;
    
    @Column()
    entity_id: number;  

    @ManyToOne(() => EntityWithPermissionsEntity)
    @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
    entity?: EntityWithPermissionsEntity;

    @ManyToMany(() => EntityPermissionEntity)
    @JoinTable({ name: "entity_role_permissions" })
    permissions: EntityPermissionEntity[]

}

