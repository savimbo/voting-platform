import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, NotFoundException, BadRequestException, ParseIntPipe, Put } from '@nestjs/common';
import { VotingService } from './voting.service';
import { CreateVotingDto } from './dto/create_voting.dto';
import { Voting } from './dto/voting.dto';
import { ApiBadRequestResponse, ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { VotingProfile } from './dto/voting_profile.dto';

@ApiTags('Voting')
@Controller('voting')
@UseGuards(JwtAuthGuard)
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @ApiOperation({ summary: 'Create a new voting' })
  @ApiOkResponse({ description: 'Voting created successfully' })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  @ApiForbiddenResponse({ description: "Insufficient rights to create voting" })
  @ApiBody({ type: CreateVotingDto })

  @Post()
  create(@Req() request, @Body() createVotingDto: CreateVotingDto) {
    return this.votingService.create(createVotingDto, request.token_data.user_id);
  }

  @ApiOperation({ summary: 'Get all votings' })
  @ApiOkResponse({ description: 'List of all votings', type: [VotingProfile] })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiForbiddenResponse({ description: "Insufficient rights to read the voting" })

  @Get()
  findAll(@Req() request) : Promise<VotingProfile[]>{
    return this.votingService.findAll(request.token_data.user_id);
  }

  @ApiOperation({ summary: 'Get a specific voting by id' })
  @ApiOkResponse({ description: 'Voting with the given ID', type: Voting })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  @ApiNotFoundResponse({ description: 'Voting not found' })
  @ApiForbiddenResponse({ description: "Insufficient rights to read the voting" })

  @Get(':id')
  async findOne(@Req() request, @Param('id') id: string): Promise<Voting>   {
    const voting = await this.votingService.findOne(id, request.token_data.user_id);
    if (!voting) {
      throw new NotFoundException(`Voting with id ${id} not found`);
    }
    return voting;
  }

  @ApiOperation({ summary: 'Updates an existing Voting' })
  @ApiOkResponse({ description: "Voting updated successfully"})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiBadRequestResponse({ description: "Missing or invalid data"})
  @ApiBody({ type: Voting })

  @Put()
  async updateVoting(@Req() request, @Body() voting: Voting) : Promise<void> {
    const ret = await this.votingService.updateVoting(voting, request.token_data.user_id);
    return ret;
  }

  
}
