import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { GlobalPermissionEntity, GlobalPermissionCategoryEntity } from './entities/global_permission.entity';
import { GlobalRoleEntity } from './entities/global_role.entity';

import { AuthModule } from 'auth/auth.module';
import { UsersModule } from 'users/users.module';
import { GlobalCacheModule } from 'cache/cache.module';
import { PermissionController } from './permission.controller';
import { EntityPermissionEntity, EntityRoleEntity, EntityWithPermissionsEntity } from './entities/entity_permission.entity';

//import { LocalizationModule } from 'localization/localization.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([GlobalPermissionEntity,
                              GlobalPermissionCategoryEntity,
                              GlobalRoleEntity,
                              EntityWithPermissionsEntity,
                              EntityPermissionEntity,
                              EntityRoleEntity
                            ]),
    GlobalCacheModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),                            

    /*                            
    AuthModule,
    LocalizationModule,
    */
  ],
  //controllers: [PhoneTypeController, PhoneUserController],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService]
})
export class PermissionModule { }
