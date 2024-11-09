import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UniversalStatus } from 'status/model/universal_status.class';
import { VotingEntity } from 'voting/entities/voting.entity';
import { VotingResults } from './vote.dto';
import { UserProfileSummary } from 'users/dto/user-profile';
import { VotingApproval } from './voting_approval.dto';
import { VotingOption } from 'voting/model/votio_option.class';

export class VotingProfile {
    @ApiProperty({ description: 'voting id'})
    id: string;

    @ApiProperty({ description: "Name of the voting", example: 'Repair bridge' })
    name_voting: string;

    @ApiProperty({ description: "Description of the voting", example: 'Repair the bridge railings that are damaged' })
    description_voting: string;

    @ApiProperty({ description: "Optional note",  nullable: true  })
    status: UniversalStatus;

    @ApiProperty({ description: 'Results of the voting'})
    results: VotingResults;

    @ApiProperty({ description: ''})
    creator: UserProfileSummary;
    @ApiProperty({ description: ''})
    approvals: VotingApproval[];
    @ApiProperty({ description: ''})
    closed_at: Date; // can be null
    @ApiProperty({ description: ''})
    closed_due_at: Date; // can be null
    @ApiProperty({ description: ''})
    final_result: VotingOption | 0 | null;

    static createFromVotingEntity(voting: VotingEntity): VotingProfile {
        const profile = new VotingProfile();
        profile.id = voting.id;
        profile.name_voting = voting.name_voting;
        profile.description_voting = voting.description_voting;
        profile.status = voting.status_id;
        profile.closed_at = voting.closed_at;
        profile.closed_due_at = voting.closed_due_at;
        profile.final_result = voting.final_result;
        return profile;
    }
}
