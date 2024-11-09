
import { Controller, Get, ParseIntPipe, Param, Post, Body, Put, UseGuards, Req, Headers } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';

import { OrganizationService } from './organization.service';
// import { getLangFromToken } from 'util/basic-utils';
import { OrganizationMember, OrganizationMemberCreationRequest } from './dto/organization_member';

@ApiTags('Organization')
@Controller('organization/member')
@UseGuards(JwtAuthGuard) 
export class OrganizationMemberController {
  constructor(private service: OrganizationService) {}


  @ApiOperation({ summary: "Returns all organization members" })
  @ApiOkResponse({ description: "Organization members", type: [OrganizationMember] })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiForbiddenResponse({ description: "Insufficient rights to access this user data"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })

  @Get()
  async getAllMembers(@Headers('x-lang') xlang: string, @Req() request, @Param('organizationId') organizationId: string): Promise<OrganizationMember[]> {
    //const lang = getLangFromToken(request);
    const ret = await this.service.findAllOrganizationMembers(xlang, request.token_data.user_id);
    return ret;
  }

  @ApiOperation({ summary: 'Create an organization membership'  })
  @ApiOkResponse({ description: "Data successfully created. Only id field in the returned object is valid", type: OrganizationMember})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiNotFoundResponse({ description: "Organization or new member not found"})
  @ApiForbiddenResponse({ description: "Insufficient rights to access this data"})
  @ApiConflictResponse({ description: "Unique constraint violation"})  // 409
  @ApiBody({ type: OrganizationMemberCreationRequest })
  
  @Post()
  async createOrgMembership(@Req() request, @Body() memberShip: OrganizationMemberCreationRequest) : Promise<OrganizationMember>  {
    const response = await this.service.createMembership(memberShip, request.token_data.user_id);
    return response;
  }


}

 