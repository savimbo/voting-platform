import { UserEntity } from "users/entities/user.entity";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileSummary {
    static populateFromUserEntity(other: UserEntity, ret: UserProfileSummary): void {
        ret.id                  = other.id;
        ret.email               = other.email;
        ret.name_legal_first    = other.name_legal_first;
        ret.name_legal_last     = other.name_legal_last;
        ret.name_display_first  = other.name_display_first;
        ret.name_display_last   = other.name_display_last;
        ret.icon_url            = other.icon_url;
    }
    static createFromUserEntity(other: UserEntity): UserProfileSummary {
        let ret = new UserProfileSummary();
        this.populateFromUserEntity(other, ret);
        return ret;
    }

    @ApiProperty({ description: 'User id', example: '7uirwyWXdMz6'})
    id: string;
    @ApiProperty({ description: 'User email', example: 'Joan@mail.com'})
    email: string;
    @ApiProperty({ description: 'User first legal name', example: 'Joan'})
    name_legal_first: string;
    @ApiProperty({ description: 'User last legal name', example: 'Smith'})
    name_legal_last: string;
    @ApiPropertyOptional({ description: 'User first name to display', example: 'Joannie'})
    name_display_first: string;
    @ApiPropertyOptional({ description: 'User last name to display', example: 'Smith'})
    name_display_last: string;
    @ApiPropertyOptional({ description: 'User profile icon URL'})
    icon_url: string;

}

export class UserProfile extends UserProfileSummary {
    static createFromUserEntity(other: UserEntity): UserProfile {
        let ret = new UserProfile();
        UserProfileSummary.populateFromUserEntity(other, ret);
        return ret;
    }   
}


export class UpdatedUserProfile {
    @ApiProperty({ description: 'Updated user profile data'})
    userProfile: UserProfile;
    @ApiProperty({ description: 'New token to authenticate the user or empty if the token has not changed', example: 'eyJhbGciOiJIUzI1NiIsI.eyJ1c2VyX2Vt' })
    access_token: string;
}
