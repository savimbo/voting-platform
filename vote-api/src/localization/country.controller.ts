
import { Controller, Get, ParseIntPipe, Param, Post, Body, HttpCode, UseGuards, Req, Headers } from '@nestjs/common';
import { CountryService } from './country.service';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CountryResponse } from './dto/country.response';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { AuthTokenPayload } from 'auth/model/token-payload';

@ApiTags('Countries')
@Controller('country')
@UseGuards(JwtAuthGuard) 
export class CountryController {
  constructor(private countryService: CountryService) {}

 
  @ApiOperation({ summary: 'Returns a list of all available countries' })
  @ApiOkResponse({ description: 'List of all available countries', type: [CountryResponse] })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })

  @Get()
  async getAllCountrys(@Headers('x-lang') xlang: string): Promise<CountryResponse[]> {
    // const token : AuthTokenPayload = request.token_data;
    // const ret = await this.countryService.findAllCountrys(token.user_lang);
    const ret = await this.countryService.findAllCountrys(xlang);
    return ret;
  }


}


  



  