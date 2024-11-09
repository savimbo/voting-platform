//import { Field, ObjectType } from '@nestjs/graphql';
//import { UserProfileSummary } from 'users/dto/user-profile';
import { UserProfileSummary } from '../../users/dto/user-profile';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GlobalPermission } from 'permission/model/global_permission.class';
import { OrganizationMembership } from 'organization/dto/organization-membership';

//@ObjectType()
export class LoginResponse {
    @ApiProperty({ description: 'Token to authenticate the user', example: 'eyJhbGciOiJIUzI1NiIsI.eyJ1c2VyX2Vt' })
    access_token: string;

    @ApiProperty({ description: 'User profile information' })
    user: UserProfileSummary;

    @ApiProperty({ description: 'User global permissions', example: ['user_profile.modify'] }) //, type: [GlobalPermission] })
    permissions: GlobalPermission[];

    @ApiProperty({ description: 'User membership', type: [OrganizationMembership] })
    membership: OrganizationMembership[];
}
