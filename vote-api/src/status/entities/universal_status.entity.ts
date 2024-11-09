
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, PrimaryColumn, OneToMany, Index } from "typeorm";
import { UniversalStatusTxEntity } from "./universal_status_tx.entity";

@Entity("universal_status")
export class UniversalStatusEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => UniversalStatusTxEntity, (status_tx) => status_tx.status)
    tx?: UniversalStatusTxEntity[]

}
