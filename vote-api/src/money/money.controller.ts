
import { Controller, Param, Post, Body, Put, UseGuards, Req, Headers, HttpCode } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { MoneyService } from './money.service';
import { PaymentSearchRequest, PaymentSearchResult } from './dto/payment_search';
import { NewIncome } from './dto/income';


@ApiTags('Numbers')
@Controller('numbers')
@UseGuards(JwtAuthGuard) 

export class MoneyController {
  constructor(private service: MoneyService) {}
 
  @ApiOperation({ summary: 'Search payments for organization or users' })
  @HttpCode(200)  // Nestjs Post returns 201 by default
  @ApiOkResponse({ description: "Payments matching the criteria", type: PaymentSearchResult})  
  @ApiForbiddenResponse({ description: "Insufficient rights to access this payment data"})
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  @ApiBody({ type: PaymentSearchRequest })
  
  @Post('payment/search')
  async searchPayment( @Headers('x-lang') xlang: string, @Req() request, @Body() params: PaymentSearchRequest) 
            : Promise<PaymentSearchResult>  {
    const reponse = await this.service.searchIncome(params, request.token_data.user_id, xlang);
    return reponse;
  }


  @ApiOperation({ summary: 'New income into the platform' })
  @ApiOkResponse({ description: "Income registered"})  
  @ApiForbiddenResponse({ description: "Insufficient right"})
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  @ApiBody({ type: NewIncome })
  
  @Post('income')
  async newIncome( @Headers('x-lang') xlang: string, @Req() request, @Body() params: NewIncome) 
            : Promise<void>  {
    const reponse = await this.service.newIncome(params, request.token_data.user_id, xlang);
    return reponse;
  }


  @ApiOperation({ summary: 'Send money to the user connected financial account' })
  @HttpCode(200)  // Nestjs Post returns 201 by default
  @ApiOkResponse({ description: "Payment completed"})  
  @ApiForbiddenResponse({ description: "Insufficient rights to access this payment data"})
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiNotFoundResponse({ description: "Payment not found"})
  @ApiConflictResponse({ description: "Recipient account not found"})
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  

  @Post('payout/:payoutId/pay')
  async payPayout(@Req() request, @Param('payoutId') id: string) : Promise<void>  {
    await this.service.payPayout(id, request.token_data.user_id);
   }

}
