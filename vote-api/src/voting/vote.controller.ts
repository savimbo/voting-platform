import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, BadRequestException, ParseIntPipe, Put } from '@nestjs/common';
import { VotingService } from './voting.service';
import {ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { VoteBallot, VoteLogEntry } from './dto/vote.dto';


@ApiTags('Voting')
@Controller('voting/:votingid/vote')
@UseGuards(JwtAuthGuard)
export class VoteController {
  constructor(
    private readonly votingService: VotingService) {}
  

  @ApiOperation({ summary: 'Submits a vote' })
  @ApiOkResponse({ description: 'Vote submitted successfully', type: [VoteLogEntry] })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  @ApiForbiddenResponse({ description: "Insufficient rights to approve the voting" })
  @ApiBody({ type: VoteBallot })

  @Post()
  create(@Req() request, @Param('votingid') votingId: string, @Body() ballot: VoteBallot) : Promise<VoteLogEntry[]> {
    return this.votingService.submitBallot(ballot, request.token_data.user_id, votingId);
  }

}
