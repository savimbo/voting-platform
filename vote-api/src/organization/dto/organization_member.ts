import { ApiProperty } from "@nestjs/swagger";
import { LegalEntity } from "legal_entity/dto/legal_entiy";
import { OrganizationRole } from "permission/dto/organization_role";


export class OrganizationMember {
    @ApiProperty({ description: 'Membership id', example: "8kfe3SvT"})
    id: string;
    @ApiProperty({ description: 'Member profile', type: LegalEntity})
    legalEntity: LegalEntity;
    @ApiProperty({ description: 'Member roles', type: [OrganizationRole]})
    roles: OrganizationRole[];
}

//@ApiExtraModels(UserProfileSummary, OrganizationProfileSummary)
export class OrganizationMemberCreationRequest {
    @ApiProperty({ description: 'New member id', example: "8kfe3SvT"})
    id: string;
    @ApiProperty({ description: 'New member role ids', example: ["n9fe3TVsq", "wk6e3aUp"]})
    roles: string[];
}