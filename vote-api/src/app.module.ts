import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database_management/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InitDbService } from 'database_management/initDB.service';
import { DatabaseVersionEntity } from 'database_management/entities/database_version.entity';
import { LangEntity } from 'localization/entities/lang.entity';
import { LangTxEntity } from 'localization/entities/lang_tx.entity';
import { CountryEntity } from 'localization/entities/country.entity';
import { CountryTxEntity } from 'localization/entities/country_tx.entity';
import { CountryCallingCodeEntity } from 'localization/entities/country_calling_code.entity'; 
import { LocalizationModule } from 'localization/localization.module';
import { PhoneTypeEntity } from 'phone/entities/phone_type.entity';
import { PhoneTypeTxEntity } from 'phone/entities/phone_type_tx.entity';
import { PhoneModule } from 'phone/phone.module';
import { AddyModule } from 'addy/addy.module';
import { PermissionModule } from 'permission/permission.module';
import { GlobalPermissionCategoryEntity, GlobalPermissionEntity } from 'permission/entities/global_permission.entity';
import { GlobalRoleEntity } from 'permission/entities/global_role.entity';
import { StateEntity } from 'localization/entities/state.entity';
import { StateTxEntity } from 'localization/entities/state_tx.entity';
import { LegalEntityModule } from 'legal_entity/legal_entity.module';
import { EntityPermissionEntity, EntityRoleEntity, EntityWithPermissionsEntity } from 'permission/entities/entity_permission.entity';
import { UniversalStatusEntity } from 'status/entities/universal_status.entity';
import { UniversalStatusTxEntity } from 'status/entities/universal_status_tx.entity';
import { UserEntity } from 'users/entities/user.entity';
import { GlobalCacheModule } from 'cache/cache.module';
import { VotingModule } from './voting/voting.module';
import { VotingOptionEntity } from 'voting/entities/voting_option.entity';
import { MoneyModule } from 'money/money.module';
import { OrganizationModule } from 'organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([  // needed for the InitDbService
      DatabaseVersionEntity,   
      UserEntity,
      LangEntity, LangTxEntity,
      CountryEntity, CountryTxEntity,
      CountryCallingCodeEntity,
      PhoneTypeEntity, PhoneTypeTxEntity,
      GlobalRoleEntity, 
      GlobalPermissionCategoryEntity, GlobalPermissionEntity,
      EntityRoleEntity,
      EntityWithPermissionsEntity, EntityPermissionEntity,
      StateEntity, StateTxEntity,
      UniversalStatusEntity, UniversalStatusTxEntity,
      VotingOptionEntity,
    ]),  // The services in the providers section need this declaration

    GlobalCacheModule,
    AuthModule,
    PhoneModule,
    AddyModule,
    UsersModule,
    OrganizationModule,
    LocalizationModule,
    PermissionModule,
    LegalEntityModule,
    VotingModule,
    MoneyModule

  ],
  providers: [InitDbService] 
})
export class AppModule { }
