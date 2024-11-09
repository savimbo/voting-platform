
import { IsEmail, IsEnum, IsString, IsNotEmpty, IsArray } from 'class-validator';
import { AuthenticationSystem } from "../../auth/dto/authentication-system"
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRequest {
        @ApiProperty({ description: 'Authentication system for the new user', example: 'Google', enum: AuthenticationSystem })
        @IsEnum(AuthenticationSystem)
    authenticationBy : AuthenticationSystem;
        @ApiProperty({ description: 'User first name', example: 'Joan'})
        @IsNotEmpty()
        @IsString()
    legalFirstName: string;
        @ApiProperty({ description: 'User Last name', example: 'Smith' })
        @IsNotEmpty()
        @IsString()
    legalLastName: string;
        @ApiProperty({ description: 'User e-mail', example: 'joan.smith@mail.com' })
        @IsEmail()
    email: string;
        @ApiProperty({ description: 'User preferred language (ISO 639-3)', example: 'spa' })
        @IsNotEmpty()
        @IsString()
    lang: string;
        @ApiPropertyOptional({ description: 'User password for authentication using email and password', example: ''})
        @IsString()
    password: string;  // EmailAndPassword
        @ApiPropertyOptional({ description: 'Token provided by the authentication authority', example: 'ya29.a0AfH6SMDD4h6PvCf3xxUdMlOeJp7FybPq77fZt5GLi' })
        @IsString()
    token: string; // Google
}

