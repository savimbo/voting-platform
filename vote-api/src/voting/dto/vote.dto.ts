
import { ApiProperty } from '@nestjs/swagger';
import { VotingOption } from 'voting/model/votio_option.class';

export class VoteBallot {
    @ApiProperty({ description: 'Submitted vote'})
    vote: VotingOption;
}

export class VoteLogEntry {
    @ApiProperty({ description: 'Vote', enum: VotingOption })
    vote: VotingOption;

    @ApiProperty({ description: 'Date when the vote was submitted'})
    created_at: Date;
}

export class VotingOptionResult {
    @ApiProperty({ description: 'Total votes for this option'})
    total_votes: number = 0;
    @ApiProperty({ description: 'Percentage for this option'})
    percentage: number = 0;
}

export class VotingResults {
    @ApiProperty({ description: 'Results for yes'})
    yes: VotingOptionResult = new VotingOptionResult();
    @ApiProperty({ description: 'Results for no'})
    no: VotingOptionResult = new VotingOptionResult();
    @ApiProperty({ description: 'Results for abstain'})
    abstain: VotingOptionResult = new VotingOptionResult();
    @ApiProperty({ description: 'Number of users that have not voted'})
    not_voted: VotingOptionResult = new VotingOptionResult();
    @ApiProperty({ description: 'Total number of submitted votes for the voting is valid'})
    quorum: VotingOptionResult = new VotingOptionResult();
    @ApiProperty({ description: 'Total number of members'})
    total_members: number;
}