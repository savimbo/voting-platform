
import { Controller, Get, ParseIntPipe, Headers, Param, Post, Put, Body, HttpCode, UseGuards, Req, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
//import { UserEntity } from './entities/user.entity';
import { UpdatedUserProfile, UserProfile } from './dto/user-profile';
import { UserSearchParameters, UserSearchRequest, UserSearchResult } from './dto/user_search';
import { CreateUserRequest } from './dto/create-user.input';

@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

 
  @ApiOperation({ summary: 'Returns a user given its Id' })
  @ApiOkResponse({ description: 'User with the given Id', type: UserProfile })
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiNotFoundResponse({ description: "User not found"})
  @ApiForbiddenResponse({ description: "Insufficient rights to access this user data"})
  
  @Get(':userId')
  async getUserById(@Req() request, @Param('userId') id: string): Promise<UserProfile> {
  
    const user = await this.userService.findUser(id, request.token_data.user_id);
    if (!user)
      throw new NotFoundException('User not found');
    const ret = UserProfile.createFromUserEntity(user);
    return ret
  }


  @ApiOperation({ summary: 'Updates user profile information' })
  @ApiOkResponse({ description: "Data successfully updated", type: UpdatedUserProfile})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiNotFoundResponse({ description: "User not found"})
  @ApiForbiddenResponse({ description: "Insufficient rights to access this user data"})
  @ApiBadRequestResponse({ description: "User Id does not match"})
  @ApiBody({ type: UserProfile })
  
  @Put(':userId')
  async updateUser(@Req() request, @Param('userId') id: string, @Body() userProfile: UserProfile) : Promise<UpdatedUserProfile>  {
    if (userProfile.id !== id){
      throw new BadRequestException('Passed User Ids mismatch');
    }
    const reponse = await this.userService.updateUser(userProfile, request.token_data.user_id);
    return reponse;
  }

  @ApiOperation({ summary: 'Creates a user'  })
  @ApiOkResponse({ description: "Data successfully created", type: UserProfile})  
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiForbiddenResponse({ description: "Insufficient rights to access this data"})
  @ApiConflictResponse({ description: "Unique constraint violation"})  // 409
  @ApiBody({ type: CreateUserRequest })
  
  @Post()
  async createUser(@Req() request, @Body() userData: CreateUserRequest) : Promise<UserProfile>  {
    const user = await this.userService.create(userData, "");
    const ret = UserProfile.createFromUserEntity(user);
    return ret
  }

  @ApiOperation({ summary: 'Search users' })
  @HttpCode(200)  // Nestjs Post returns 201 by default
  @ApiOkResponse({ description: "Search result", type: UserSearchResult})  
  @ApiForbiddenResponse({ description: "Insufficient rights to access this user data"})
  @ApiUnauthorizedResponse({ description: "Invalid token"})
  @ApiHeader({ name: 'x-lang', description: 'Language code' })
  @ApiBody({ type: UserSearchRequest })
  
  @Post('search')
  async searchUsers(@Req() request, @Body() params: UserSearchRequest) : Promise<UserSearchResult>  {
    const reponse = await this.userService.searchUsers(params, request.token_data.user_id);
    return reponse;
  }

}
