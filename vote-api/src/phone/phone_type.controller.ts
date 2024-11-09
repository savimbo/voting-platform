
import { Controller, Get, ParseIntPipe, Param, Post, Body, HttpCode, UseGuards, Req, Headers } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PhoneTypeResponse } from './dto/phone_type.response';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { AuthTokenPayload } from 'auth/model/token-payload';

@ApiTags('Phones')
@Controller('phone_type')
@UseGuards(JwtAuthGuard) 
export class PhoneTypeController {
  constructor(private phoneService: PhoneService) {}

 
  @ApiOperation({ summary: 'Returns a list of all available phone types' })
  @ApiOkResponse({ description: 'List of all available phone types', type: [PhoneTypeResponse] })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })

  @Get()
  async getAllCountrys(@Headers('x-lang') xlang: string /*, @Req() request*/): Promise<PhoneTypeResponse[]> {
    // const token : AuthTokenPayload = request.token_data;
    // const lang = token.user_lang ?? 'eng';
    const ret = await this.phoneService.findAllPhoneTypes(xlang);
    return ret;
  }


}


  