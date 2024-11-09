import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, BadRequestException, ParseIntPipe, Put } from '@nestjs/common';
import { VotingService } from './voting.service';
import {ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { VotingApproval, VotingApprovalRequest } from './dto/voting_approval.dto';

@ApiTags('Voting')
@Controller('voting/:votingid/approval')
@UseGuards(JwtAuthGuard)
export class VotingApprovalController {
  constructor(
    private readonly votingService: VotingService) {}
  

  @ApiOperation({ summary: 'Submits a new approval for the voting. It all the admin users approved it the voting status is changed to "Active"' })
  @ApiOkResponse({ description: 'Approval created successfully', type: [VotingApproval] })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  @ApiForbiddenResponse({ description: "Insufficient rights to approve the voting" })
  @ApiBody({ type: VotingApprovalRequest })

  @Post()
  create(@Req() request, @Param('votingid') votingId: string, @Body() approval: VotingApprovalRequest) 
        : Promise<VotingApproval[]> {
    return this.votingService.createApproval(approval, request.token_data.user_id, votingId);
  }

  
}
