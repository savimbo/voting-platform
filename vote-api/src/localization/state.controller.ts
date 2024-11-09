
import { Controller, Get, ParseIntPipe, Param, Post, Body, HttpCode, UseGuards, Req, Headers } from '@nestjs/common';
import { StateService } from './state.service';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { StateResponse } from './dto/state.response';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { AuthTokenPayload } from 'auth/model/token-payload';

@ApiTags('Countries')
@Controller('country/:country_id/states')
@UseGuards(JwtAuthGuard) 
export class StateController {
  constructor(private stateService: StateService) {}

 
  @ApiOperation({ summary: 'Returns a list of the states/provinces/departments of a country' })
  @ApiOkResponse({ description: 'List of the states of a country', type: [StateResponse] })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })

  @Get()
  async getAllStates(@Headers('x-lang') xlang: string, @Param('country_id') countryId: string): Promise<StateResponse[]> {
    // const token : AuthTokenPayload = request.token_data;
    // const ret = await this.stateService.findAllStates(countryId, token.user_lang);
    const ret = await this.stateService.findAllStates(countryId, xlang);
    return ret;
  }


}


 