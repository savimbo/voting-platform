import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("organization_vote_settings")
export class OrganizationVoteSettingsEntity {
    @PrimaryColumn()
    id: string = 'org'
    
    @Column()
    split_invest_pctg : number = 30

    @Column()
    split_group_pctg : number = 40

    @Column()
    split_direct_pctg : number = 30

    @Column()
    delay_invest : number = 5

    @Column()
    vote_quorum_pctg : number = 90

    @Column()
    superadmin_quorum_pctg : number = 66

    @Column()
    delay_vote_days : number = 14

    @Column()
    delay_cycle_months : number = 12

}