
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { GlobalPermissionEntity } from "./global_permission.entity";

@Entity("global_role")
export class GlobalRoleEntity {
    @PrimaryColumn({ type: 'text' })
    id?: string;

    @Column()
    name: string;

    @Column()
    description1: string;

    @Column()
    description2: string;

    @ManyToMany(() => GlobalPermissionEntity)
    @JoinTable({ name: "global_role_permissions" })
    permissions: GlobalPermissionEntity[]
}


