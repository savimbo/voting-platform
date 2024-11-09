import { ApiProperty } from "@nestjs/swagger";


export class OrganizationVoteSettings {

    @ApiProperty({ description: '% group payments that is put into delayed payment for the group', example: "30"})
    split_invest_pctg : number

    @ApiProperty({ description: '% of group payments that go into the KAPITAL voting algorithm', example: "40"})
    split_group_pctg : number 

    @ApiProperty({ description: '% of group payments that is evenly distributed into direct payments for all member accounts linked to the organization', example: "30"})
    split_direct_pctg : number

    @ApiProperty({ description: '# of years invest payments are delayed before being sent out', example: "5"})
    delay_invest : number 

    @ApiProperty({ description: '% of org members that are required to pass a valid vote (quorum)', example: "90"})
    vote_quorum_pctg : number 

    @ApiProperty({ description: '% of superadmins required to submit a vote, and move it from the Review status to the Active status', example: "66"})
    superadmin_quorum_pctg : number 

    @ApiProperty({ description: '# days that a vote is in Active status. If a vote does not a receive votes > vote_quorum then it automatically reverts to status Hold', example: "14"})
    delay_vote_days : number 

    @ApiProperty({ description: '# months after a voting window before a new vote can become active. ', example: "12"})
    delay_cycle_months : number

    static createFromEntity(OrganizationVoteSettingsEntity: any): OrganizationVoteSettings {
        const ret = new OrganizationVoteSettings();
        ret.split_invest_pctg = OrganizationVoteSettingsEntity.split_invest_pctg;
        ret.split_group_pctg = OrganizationVoteSettingsEntity.split_group_pctg;
        ret.split_direct_pctg = OrganizationVoteSettingsEntity.split_direct_pctg;
        ret.delay_invest = OrganizationVoteSettingsEntity.delay_invest;
        ret.vote_quorum_pctg = OrganizationVoteSettingsEntity.vote_quorum_pctg;
        ret.superadmin_quorum_pctg = OrganizationVoteSettingsEntity.superadmin_quorum_pctg;
        ret.delay_vote_days = OrganizationVoteSettingsEntity.delay_vote_days;
        ret.delay_cycle_months = OrganizationVoteSettingsEntity.delay_cycle_months;
        return ret;
    }
}
    
