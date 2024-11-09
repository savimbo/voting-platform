import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalPermissionCategoryEntity, GlobalPermissionEntity } from './entities/global_permission.entity';
import { GlobalRoleEntity } from './entities/global_role.entity';
import { GlobalPermission, GlobalPermissionClass } from './model/global_permission.class';
import { UsersService } from 'users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GlobalPermissionCategory } from './dto/global_permission_detail';
import { GlobalRole } from './dto/global_role';
import { OrganizationRole } from './dto/organization_role';
import { EntityPermissionEntity, EntityRoleEntity } from './entities/entity_permission.entity';
import { OrganizationPermissionDetail } from './dto/organization_permission_detail';
import { OrganizationPermission } from './model/entity_permission.class';
//import { LangService } from './lang.service';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(GlobalPermissionEntity)
        private globalPermissionRepository: Repository<GlobalPermissionEntity>,
        @InjectRepository(GlobalRoleEntity)
        private globalRoleRepository: Repository<GlobalRoleEntity>,
        @InjectRepository(EntityRoleEntity)
        private entityRoleRepository: Repository<EntityRoleEntity>,
        @InjectRepository(GlobalPermissionCategoryEntity)
        private globalCategoryRepository: Repository<GlobalPermissionCategoryEntity>,
        @InjectRepository(EntityPermissionEntity)
        private entityPermissionRepository: Repository<EntityPermissionEntity>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
       // private langService: LangService
    ) { }

    private getPermissionCacheKeyForUser(user: string): string {
        return `permissions_${user}`;
    }

    // #region Global permissions
    async getGlobalPermissionsForUser(forUser: string): Promise<GlobalPermission[]> {
        const cacheKey = this.getPermissionCacheKeyForUser(forUser);
        let ret : GlobalPermission[] = await this.cacheManager.get(cacheKey);
        if (ret) {
            console.log('getGlobalPermissionsForUser cache hit ', ret);
            return ret;
        }
        console.log('getGlobalPermissionsForUser not in cache');
        ret = [];   
        const user = await this.usersService.findUser(forUser, forUser, ['roles']);
        for (const role of user.roles) {
            //console.log('getGlobalPermissionsForUser role ', role);
            const populatedRole = await this.globalRoleRepository.findOne({
                                                                    where: { id: role.id }, 
                                                                    relations: ['permissions'] 
                                                                });
                                                                /*
                    function castToColor(color: string): Colors | undefined {
                        if (Object.values(Colors).includes(color as Colors)) {
                            return color as Colors;
                        }
                        return undefined; // O puedes lanzar un error si el valor no es válido
                    }
                        */
            for (const permission of populatedRole.permissions) {                                                                    
                if (!ret.includes(permission.text_id as GlobalPermission)) {
                    ret.push(permission.text_id as GlobalPermission);
                }
            }
        }
        await this.cacheManager.set(cacheKey, ret);
        return ret;
    }

    
    async getAllGlobalCategories(): Promise<GlobalPermissionCategory[]> {
      const categories = await this.globalCategoryRepository.find();
      return categories;
    }

    async getAllGlobalRoles(): Promise<GlobalRole[]> {
        const roles = await this.globalRoleRepository.find( { relations: ['permissions'] });
        return roles.map(r => {
            return {
                id: r.id,
                name: r.name,
                description1: r.description1,
                description2: r.description2,
                permissions: r.permissions.map(p => p.id)
            }
        });
    }

    async getAllGlobalPermissions(): Promise<GlobalPermissionEntity[]> {
        return await this.globalPermissionRepository.find();
    }

    // #region Organization

    async getAllOrgPermissions(): Promise<OrganizationPermissionDetail[]> {
        return await this.entityPermissionRepository.find( {where: { entity_id: 3 }});
    }
    
    async getAllOrgRoles(): Promise<OrganizationRole[]> {
        const roles = await this.entityRoleRepository.find( { 
                                                            where: { entity_id: 3 },
                                                            relations: ['permissions'] });
        return roles.map(r => {
            return {
                id: r.id,
                name: r.name,
                description1: r.description1,
                description2: r.description2,
                permissions: r.permissions.map(p => p.text_id)
            }
        });
    }

    // internal use only so far
    async getAllAdminOrgRoles() : Promise<string[]> { 
        const query = await this.entityRoleRepository
                .createQueryBuilder("entity_role")
                .innerJoin("entity_role.permissions", "permission")
                .where("permission.text_id = :valor", { valor: OrganizationPermission.organization_ADMIN })
                //.where("(permission.text_id = :valor OR permission.text_id = :valor2)", { valor: OrganizationPermission.organization_ADMIN, valor2: OrganizationPermission.organization_CREATOR })
                .andWhere("entity_role.entity_id = :roleType", { roleType: 3 })
                ;
        //console.log('query ', query.getQuery());
        const roles = await query.getMany();

        return roles.map(r => r.id);
    }

    async getAllVotingOrgRoles() : Promise<string[]> { 
        const query = await this.entityRoleRepository
                .createQueryBuilder("entity_role")
                .innerJoin("entity_role.permissions", "permission")
                .where("permission.text_id = :valor", { valor: OrganizationPermission.organization_MEMBER })
                .andWhere("entity_role.entity_id = :roleType", { roleType: 3 })
                ;
        //console.log('query ', query.getQuery());
        const roles = await query.getMany();

        return roles.map(r => r.id);
    }

}
