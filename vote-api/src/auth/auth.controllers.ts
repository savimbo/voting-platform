
import { Controller, Get, Post, Body, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserRequest } from 'users/dto/create-user.input';
import { LoginResponse } from "./dto/login-auth.response"
import { LoginUserRequest } from "./dto/login-user.request"
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Signing and Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @ApiOperation({ summary: 'Creates a new user' })
  @ApiCreatedResponse({ description: "User created successfully", type: LoginResponse})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiBadRequestResponse({ description: "Missing or invalid data"})
  @ApiForbiddenResponse({ description: "User already exists"})
  @ApiConflictResponse({ description: "Unique constrain violation"})
  @ApiBody({ type: CreateUserRequest })
  @Post('new')
  async createNewUser(@Body() createAuthInput: CreateUserRequest) : Promise<LoginResponse>  {
    const reponse = await this.authService.signup(createAuthInput);
    return reponse;
  }

  @ApiOperation({ summary: 'Sign in a user' })
  @HttpCode(200)  // Nestjs Post returns 201 by default
  @ApiOkResponse({ description: "User successfully signed in", type: LoginResponse})  // { description: " "}
  @ApiUnauthorizedResponse({ description: "Invalid token or authority"})
  @ApiBadRequestResponse({ description: "User does not exist"})
  @ApiBody({ type: LoginUserRequest })
  @Post('login')
  async login(@Body() loginData: LoginUserRequest) : Promise<LoginResponse>  {
    const reponse = await this.authService.login(loginData);
    return reponse;
  }

  @UseGuards(JwtAuthGuard)
  @Post('loginAsUser')
  async loginAsUser(@Req() request, @Body() loginData: LoginUserRequest) : Promise<LoginResponse>  {
    const reponse = await this.authService.loginAsUser(loginData, request.token_data.user_id);
    return reponse;
  }


}


  