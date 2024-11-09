
import { Controller, Get, ParseIntPipe, Param, Post, Body, Put, UseGuards, Req, Headers } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { AuthTokenPayload } from 'auth/model/token-payload';
import { UsersService } from './users.service';
import { Address } from 'addy/dto/address';
// import { getLangFromToken } from 'util/basic-utils';

@ApiTags('Users')
@Controller('user/:userId/address')
@UseGuards(JwtAuthGuard) 

export class UserAddressController {
  constructor(private usersService: UsersService) {}

 
  @ApiOperation({ summary: "Returns user's address" })
  @ApiOkResponse({ description: "User's address", type: Address })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })

  @Get()
  async getAddy(@Headers('x-lang') xlang: string, @Req() request, @Param('userId') userId: string): Promise<Address> {
    //const lang = getLangFromToken(request);
    const ret = await this.usersService.findAddyForUser(xlang, userId, request.token_data.user_id);
    return ret;
  }

      
  @ApiOperation({ summary: "Updates user's address" })
  @ApiOkResponse({ description: "Address updated successfully", type: Address})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiBadRequestResponse({ description: "Missing or invalid data"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  @ApiBody({ type: Address })

  @Put()
  async updateAddy(@Headers('x-lang') xlang: string, @Req() request, @Param('userId') userId: string, @Body() addyData: Address) : Promise<Address> {
    //const lang = getLangFromToken(request);
    const ret = await this.usersService.updateAddyForUser(addyData, xlang, userId, request.token_data.user_id);
    return ret;
  }

}
