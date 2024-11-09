import { ApiProperty } from '@nestjs/swagger';

export class OrganizationPermissionDetail {
    @ApiProperty({ description: 'Permission Id', example: 17 })
    id: number;
    
    @ApiProperty({ description: 'Permission unique string', example: 'ent.organization.member' })
    text_id: string;

    @ApiProperty({ description: 'Description', example: 'Can view organization data' })
    scope: string;
  }

  

  