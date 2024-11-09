import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { LocalizedUniversalStatus } from "status/dto/universal_status.dto";
import { UserProfileSummary } from "users/dto/user-profile";


export class LegalEntity {
    @ApiProperty({ description: 'Legal entity id', example: "8kfe3SvT"})
    id: string;
    @ApiPropertyOptional({ description: 'Legal entity guid. Read-only'})
    uid: string;
    @ApiProperty({ description: 'Peronality: user or organization', example: "user"})
    personality: string;  
    @ApiProperty({ description: 'Natural person data', type: UserProfileSummary})
    person : UserProfileSummary
    @ApiProperty({ description: 'Legal entity account status', type: LocalizedUniversalStatus})
    status: LocalizedUniversalStatus;
    
}

