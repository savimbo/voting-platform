import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { LocalizationModule } from 'localization/localization.module';
import { PermissionModule } from 'permission/permission.module';
import { AddyModule } from 'addy/addy.module';
import { LegalEntityModule } from 'legal_entity/legal_entity.module';
import { OrganizationMemberController } from './organization_member.controller';
import { OrganizationMembershipEntity } from './entities/organization_membership.entity';
import { UsersModule } from 'users/users.module';
import { OrganizationVoteSettingsEntity } from './entities/organization_vote_settings.entity';
import { OrganizationVoteSettingsController } from './organization_vote_settings.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: 
    [
    TypeOrmModule.forFeature([OrganizationMembershipEntity, OrganizationVoteSettingsEntity]),
    forwardRef(() => AuthModule),
    LocalizationModule,
    PermissionModule,
    AddyModule,
    LegalEntityModule,
    UsersModule,
    ],
  
    controllers: [ OrganizationMemberController, OrganizationVoteSettingsController],

  providers: [ OrganizationService],
  exports:  [OrganizationService],
})
export class OrganizationModule { }
