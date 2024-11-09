import { ApiProperty, PartialType } from '@nestjs/swagger';
import { VotingEntity } from 'voting/entities/voting.entity';
import { ItemVoting } from './item_voting.dto';
import { UniversalStatus } from 'status/model/universal_status.class';
import { VotingApproval } from './voting_approval.dto';
import { VoteLogEntry, VotingResults } from './vote.dto';
import { UserProfileSummary } from 'users/dto/user-profile';
import { VotingOption } from 'voting/model/votio_option.class';

export class Voting {

    @ApiProperty({ description: 'voting id'})
    id: string;

    @ApiProperty({ description: "Name of the voting", example: 'Repair bridge' })
    name_voting: string;

    @ApiProperty({ description: "Description of the voting", example: 'Repair the bridge railings that are damaged' })
    description_voting: string;

    @ApiProperty({ description: "Optional note",  nullable: true  })
    note_voting: string;

    @ApiProperty({description: "List of items related to this voting", type: () => [ItemVoting]}) 
    items: ItemVoting[];

    @ApiProperty({ description: 'Voting status', enum: UniversalStatus})
    status: UniversalStatus;

    @ApiProperty({ description: 'Vote creator. Read-only', enum: UniversalStatus})
    creator: UserProfileSummary;

    @ApiProperty({ description: 'Date of the voting activation'})
    created_at: Date; 

    @ApiProperty({ description: 'Approvals for the voting', type: () => [VotingApproval]}) 
    approvals: VotingApproval[];

    @ApiProperty({ description: 'Votes submitted by the calling user to this voting', type: () => [VoteLogEntry]}) 
    calling_user_votes: VoteLogEntry[];

    @ApiProperty({ description: 'Results of the voting'})
    results: VotingResults;

    @ApiProperty({ description: 'Date of the voting activation'})
    active_at: Date; 

    @ApiProperty({ description: 'Date of the voting closing'})
    closed_at: Date; 

    @ApiProperty({ description: 'Voting result'})
    final_result: VotingOption | 0 | null;


    static populateFromVotingEntity(voting: VotingEntity, ret: Voting): void {
        ret.id = voting.id;
        ret.name_voting = voting.name_voting;
        ret.description_voting = voting.description_voting;
        ret.items = voting.items;
        ret.status = voting.status_id;
        ret.note_voting = voting.note_voting;
        ret.created_at = voting.created_at;
        ret.active_at = voting.active_at;
        ret.closed_at = voting.closed_at;
        ret.final_result = voting.final_result;
    }

    static createFromVotingEntity(voting: VotingEntity): Voting {
        const ret = new Voting();
        this.populateFromVotingEntity(voting, ret);
        return ret;
    }

}
