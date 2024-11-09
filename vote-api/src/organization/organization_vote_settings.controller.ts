import { Controller, Get, ParseIntPipe, Param, Post, Body, Put, UseGuards, Req, Headers } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import { OrganizationVoteSettings } from './dto/organization_vote_settings';

@ApiTags('Voting')
@Controller('organization/voteSettings')
@UseGuards(JwtAuthGuard) 

export class OrganizationVoteSettingsController {
  constructor(private service: OrganizationService) {}

 
  @ApiOperation({ summary: "Returns the organization vote settings" })
  @ApiOkResponse({ description: "Organization vote settings", type: OrganizationVoteSettings })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiForbiddenResponse({ description: "User does not have permission to access these settings"})
  @ApiNotFoundResponse({ description: "Organization or settings not found"})
  
  @Get()
  async getVoteSetting(@Req() request): Promise<OrganizationVoteSettings> {
    const ret = await this.service.findVoteSettingForOrganization(request.token_data.user_id);
    return ret;
  }

  
  @ApiOperation({ summary: "Updates the organization vote settings" })
  @ApiOkResponse({ description: "Settings updated successfully"})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiBadRequestResponse({ description: "organization id mismatch"})
  @ApiForbiddenResponse({ description: "User does not have permission to access these settings"})
  @ApiNotFoundResponse({ description: "Organization or settings not found"})
  @ApiUnprocessableEntityResponse({ description: "Invalid settings. Check the response text for more details"})
  @ApiBody({ type: OrganizationVoteSettings })
  
  @Put()
  async updateVoteSetting(@Req() request, @Body() settings: OrganizationVoteSettings) : Promise<void> {
    const ret = await this.service.updateVoteSettingForOrganization(settings, request.token_data.user_id);
    return ret;
  }

}
