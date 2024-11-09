import { Controller, Get, ParseIntPipe, Param, Post, Body, Put, UseGuards, Req, Headers } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PhoneTypeResponse } from './dto/phone_type.response';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { AuthTokenPayload } from 'auth/model/token-payload';
import { Phone } from './dto/phone';
// import { getLangFromToken } from 'util/basic-utils';

@ApiTags('Users')
@Controller('user/:userId/phone')
@UseGuards(JwtAuthGuard) 

export class PhoneUserController {
  constructor(private phoneService: PhoneService) {}

 
  @ApiOperation({ summary: "Returns a list of all user's phones" })
  @ApiOkResponse({ description: "List of all user's phones", type: [Phone] })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })

  @Get()
  async getAllPhones(@Headers('x-lang') xlang: string, @Req() request, @Param('userId') userId: string): Promise<Phone[]> {
    //const lang = getLangFromToken(request);
    const ret = await this.phoneService.findAllPhonesForUser(xlang, userId, request.token_data.user_id);
    return ret;
  }

  /*
  @Get(':phoneId')
  async getPhone(@Req() request, @Param('userId', ParseIntPipe) userId: number, @Param('phoneId', ParseIntPipe) phoneId: number) {
    console.log(`Get phone ${phoneId} for user ${userId}, caller: ${request.token_data.user_id}`);
    // Lógica para obtener el teléfono
    //return `Get phone ${phoneId} for user ${userId}`;
  }
*/
  
  @ApiOperation({ summary: 'Creates a new phone for the given user' })
  @ApiCreatedResponse({ description: "Phone created successfully", type: Phone})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiBadRequestResponse({ description: "Missing or invalid data"})
  //@ApiForbiddenResponse({ description: "User already exists"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  @ApiBody({ type: Phone, description: "'id' and 'phone_type.localized_name' fields will be ignored" })

  @Post()
  async addPhone(@Headers('x-lang') xlang: string, @Req() request, @Param('userId') userId: string, @Body() phoneData: Phone) : Promise<Phone>  {
    //const lang = getLangFromToken(request);
    const ret = await this.phoneService.createPhoneForUser(phoneData, xlang, userId, request.token_data.user_id);
    return ret;
  }

  
  @ApiOperation({ summary: 'Updates an existing phone for the given user' })
  @ApiOkResponse({ description: "Phone updated successfully", type: Phone})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiBadRequestResponse({ description: "Missing or invalid data"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  @ApiBody({ type: Phone })

  @Put(':phoneId')
  async updatePhone(@Headers('x-lang') xlang: string, @Req() request, @Param('userId') userId: string, 
                    @Param('phoneId', ParseIntPipe) phoneId: number, @Body() phoneData: Phone) : Promise<Phone> {
    //const lang = getLangFromToken(request);
    const ret = await this.phoneService.updatePhoneForUser(phoneId, phoneData, xlang, userId, request.token_data.user_id);
    return ret;
  }

  /*
  @Delete(':phoneId')
  async deletePhone(@Param('userId') userId: string, @Param('phoneId') phoneId: string) {
    // Lógica para eliminar el teléfono
    return `Delete phone ${phoneId} for user ${userId}`;
  }
*/


}

