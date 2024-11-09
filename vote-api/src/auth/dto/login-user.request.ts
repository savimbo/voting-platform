
import { IsEmail, IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { AuthenticationSystem } from "./authentication-system"
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


//@InputType()
export class LoginUserRequest
 {
        @ApiProperty({ description: 'Authentication system for the new user', example: 'Google', enum: AuthenticationSystem })
        @IsEnum(AuthenticationSystem)
    authenticationBy : AuthenticationSystem;
        @ApiProperty({ description: 'User e-mail', example: 'joan.smith@mail.com' })
        @IsEmail()
    email: string;
        @ApiPropertyOptional({ description: 'User password for authentication using email and password', example: ''})
        @IsString()
    password: string;  // for EmailAndPassword
        @ApiPropertyOptional({ description: 'Token provided by the authentication authority', example: 'ya29.a0AfH6SMDD4h6PvCf3xxUdMlOeJp7FybPq77fZt5GLi' })
        @IsString()
    token: string; // for Google
}
