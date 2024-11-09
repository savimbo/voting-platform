
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity("global_permission_category")
export class GlobalPermissionCategoryEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    description: string;
}


@Entity("global_permission")
export class GlobalPermissionEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    text_id: string;

    @Column()
    category_id: number;  // for user interface, to show the permissions grouped

    @Column()
    scope: string;

    @ManyToOne(() => GlobalPermissionCategoryEntity)
    @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
    category?: GlobalPermissionCategoryEntity;

}
