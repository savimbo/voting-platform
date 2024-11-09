
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileSummary } from 'users/dto/user-profile';
import { VotingOption } from 'voting/model/votio_option.class';

export class VotingApprovalRequest {
    @ApiProperty({ description: 'Approve or revoke approval of the voting'})
    approved: VotingOption;
}

export class VotingApproval {
    @ApiProperty({ description: 'User who approved the voting', type: UserProfileSummary })
    user: UserProfileSummary;

    @ApiProperty({ description: 'Approve or revoke approval of the voting'})
    approved: VotingOption;

    @ApiProperty({ description: 'Date when the voting was approved. It can be null if the approval has not been issued yet'})
    created_at: Date;
}
