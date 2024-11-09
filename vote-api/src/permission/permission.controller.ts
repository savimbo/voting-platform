import { Controller, Get, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { PermissionService } from './permission.service';
import { GlobalPermissionEntity } from './entities/global_permission.entity';
import { GlobalRoleEntity } from './entities/global_role.entity';
import { GlobalPermissionCategory, GlobalPermissionDetail } from './dto/global_permission_detail';
import { GlobalRole } from './dto/global_role';
import { OrganizationRole } from './dto/organization_role';
import { OrganizationPermissionDetail } from './dto/organization_permission_detail';

@ApiTags('Roles and permissions')
@Controller('permission')
@UseGuards(JwtAuthGuard)  
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Returns a list of all permissions' })
  @ApiOkResponse({ description: 'List of all permissions', type: [GlobalPermissionDetail] })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @Get()
  async getAllPermissions(): Promise<GlobalPermissionDetail[]> {
    return this.permissionService.getAllGlobalPermissions();
  }

  @ApiOperation({ summary: 'Returns a list of all roles' })
  @ApiOkResponse({ description: 'List of all roles', type: [GlobalRole] })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiHeader({ name: 'x-lang', description: 'Language code', required: true, example: 'spa' })
  
  @Get('role')
  async getAllRoles(@Headers('x-lang') xlang: string ): Promise<GlobalRole[]> {
    return this.permissionService.getAllGlobalRoles();
  }

  @ApiOperation({ summary: 'Returns a list of all permission categories' })
  @ApiOkResponse({ description: 'List of all permission categories', type: [GlobalPermissionCategory] })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @Get('category')
  async getAllCategories(): Promise<GlobalPermissionCategory[]> {
    return this.permissionService.getAllGlobalCategories();
  }

  @ApiOperation({ summary: 'Returns a list of all organization-specific roles' })
  @ApiOkResponse({ description: 'List of all roles that grant rights to users over organizations', type: [OrganizationRole] })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @Get('organization/role')
  async getAllOrgRoles(): Promise<OrganizationRole[]> {
    return this.permissionService.getAllOrgRoles();
  }

  @ApiOperation({ summary: 'Returns a list of all organization-specific permissions' })
  @ApiOkResponse({ description: 'List all permissions available to organizations members', type: [OrganizationPermissionDetail] })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @Get('organization')
  async getAllOrgPermissions(): Promise<OrganizationPermissionDetail[]> {
    return this.permissionService.getAllOrgPermissions();
  }
  
}
