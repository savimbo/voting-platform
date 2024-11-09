import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'users/entities/user.entity';
import { UsersService } from './users.service';
import { AuthModule } from 'auth/auth.module';
import { UsersController } from './users.controller';
import { LocalizationModule } from 'localization/localization.module';
import { PermissionModule } from 'permission/permission.module';
import { AddyModule } from 'addy/addy.module';
import { UserAddressController } from './user_address.controller';
import { LegalEntityModule } from 'legal_entity/legal_entity.module';

@Module({
  
  imports: [
    TypeOrmModule.forFeature([UserEntity ]),
    forwardRef(() => AuthModule),
    LocalizationModule,
    forwardRef(() => PermissionModule),
    AddyModule,
    LegalEntityModule
  ],

  controllers: [UsersController, UserAddressController],

  providers: [UsersService],

  exports: [UsersService]
})
export class UsersModule { }
