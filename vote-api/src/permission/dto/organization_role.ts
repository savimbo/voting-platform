import { ApiProperty } from '@nestjs/swagger';
import { EntityRoleEntity } from 'permission/entities/entity_permission.entity';

export class OrganizationRole {
    @ApiProperty({ description: 'Role Id', example: '38XmZWFa6sVk' })
    id: string;

    @ApiProperty({ description: 'Role name', example: "Member" })
    name: string;

    @ApiProperty({ description: 'Role description' })
    description1: string;

    @ApiProperty({ description: 'Role description' })
    description2: string;

    @ApiProperty({ description: 'Organization permissions granted to this role'/*, type: [String]*/ })
    permissions: string[];

    static createFromEntity(entity: EntityRoleEntity) : OrganizationRole {
        const role = new OrganizationRole();
        role.id = entity.id;
        role.name = entity.name;
        role.description1 = entity.description1;
        role.description2 = entity.description2;
        role.permissions = entity.permissions.map(perm => perm.text_id);  // EntityPermissionEntity
        return role;
    } 
  }
