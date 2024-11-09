import { ApiProperty } from "@nestjs/swagger";
import { OrganizationRole } from "permission/dto/organization_role";
import { OrganizationMembershipEntity } from "organization/entities/organization_membership.entity";


// Organization membership information of a given user

export class OrganizationMembership {
    @ApiProperty({ description: 'User roles for the organization', type: [OrganizationRole]})
    roles: OrganizationRole[];

    static createFromEntity(entity: OrganizationMembershipEntity): OrganizationMembership {
        const membership = new OrganizationMembership();
        membership.roles = entity.roles.map(role => OrganizationRole.createFromEntity(role));
        return membership;
    }
}

