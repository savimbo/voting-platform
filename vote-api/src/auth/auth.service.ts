import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { ErrorCode } from 'constants/error-code';
import { get } from 'lodash';
import   axios  from 'axios';
import { CreateUserRequest } from 'users/dto/create-user.input';
import { AuthenticationSystem } from "./dto/authentication-system"
import { UserEntity } from 'users/entities/user.entity';
import { UserProfileSummary } from 'users/dto/user-profile';
import { UsersService } from 'users/users.service';
import { LoginResponse } from "./dto/login-auth.response"
import { LoginUserRequest } from "./dto/login-user.request"
import { AuthTokenPayload } from "./model/token-payload"
import { PermissionService } from 'permission/permission.service';
import { GlobalPermission, GlobalPermissionClass } from 'permission/model/global_permission.class';
import { OrganizationService } from 'organization/organization.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private permissionService: PermissionService,
        private orgnizationService: OrganizationService
    ) { }

    async signup(createAuthInput: CreateUserRequest) : Promise<LoginResponse>  {
        let iconStringWrapper = { value: '' };
        if (createAuthInput.authenticationBy == AuthenticationSystem.Google){
            const ok = await this.validateGoogleToken(createAuthInput.email, createAuthInput.token, iconStringWrapper);
            if (!ok) {
                throw new UnauthorizedException()
            }
        }
        const newUser = await this.usersService.create(createAuthInput, iconStringWrapper.value);
        if (newUser) {
            return await this.GetLoginToken(newUser);
        }
        return null;
    }

    async login(loginData: LoginUserRequest) : Promise<LoginResponse>  {
        console.log("Auth::login: " + loginData.authenticationBy + ", " + loginData.email);

        const existingUser = await this.usersService.findByEmail(loginData.email);
        if (!existingUser) {
            throw new BadRequestException('User or password not found',{ description: ErrorCode.SIGNUP_REGISTER_ERROR })
        }
        if (loginData.authenticationBy == AuthenticationSystem.EmailAndPassword){
            throw new UnauthorizedException("Authority not supported")
        }
        if (loginData.authenticationBy == AuthenticationSystem.Google){
            const ok = await this.validateGoogleToken(loginData.email, loginData.token, null);
            if (!ok) {
                throw new UnauthorizedException()
            }
            return await this.GetLoginToken(existingUser);
        }
        return null;
    }

    async loginAsUser(loginData: LoginUserRequest, byUser:string) : Promise<LoginResponse>  {
        console.log(`Auth::loginAsUser: ${loginData.email} by ${byUser}`); 

        const existingUser = await this.usersService.findByEmail(loginData.email);
        if (!existingUser) {
            throw new BadRequestException('User')
        }
        const permissions = await this.permissionService.getGlobalPermissionsForUser(byUser);
        if (!GlobalPermissionClass.contains(permissions, [GlobalPermission.sys_admin_FULL])) {   
            throw new UnauthorizedException("Insufficient rights")
        }
        return await this.GetLoginToken(existingUser);
    }


    private async GetLoginToken(user: UserEntity) : Promise<LoginResponse> {
        const tokenPayload : AuthTokenPayload = {
            user_email: user.email,
            user_id: user.id,
            user_lang: user.lang_id
        }
        let loginResponse = new LoginResponse();
        loginResponse.access_token  = this.jwtService.sign(tokenPayload);
        loginResponse.user          = UserProfileSummary.createFromUserEntity(user);
        loginResponse.permissions   = await this.permissionService.getGlobalPermissionsForUser(user.id);
        loginResponse.membership    = await this.orgnizationService.findOrganizationsOfUser(user);
        return loginResponse;
    }

    private async validateGoogleToken(email: string, token: string, iconUrl?: {value:string}) : Promise<boolean> {
        const demoMode = true
        if (demoMode) {
            return true; 
        }
        try {
            const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                                                params: {
                                                    access_token: `${token}` 
                                                }
                                            });
            const email1 = email.toLowerCase();
            const email2 = response.data.email.toLowerCase();
            if (iconUrl){
                iconUrl.value = response.data.picture;
            }
            if (email1 != email2) {
                //console.log('Error validating google token: emails dont match ', email1, email2);    
            }
            return email1 == email2; 
        } 
        catch (error) {
            console.log('Error validating google token', error);
            return false;
        }
    }

    private async validatePassword(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if(!user){
            throw new NotFoundException('User not found',{
                description: ErrorCode.LOGIN_NAME_ERROR
            })
        }

        const storedPassword = get(user, 'pwdhas');  
        const isValid = await compare(password, storedPassword)
        
        if (isValid) {
            const { pwdhas, ...result } = user;

            return result
        }
        throw new BadRequestException('Incorrect password',{
            description: ErrorCode.LOGIN_PASSWORD_ERROR
        })
}

    
}
