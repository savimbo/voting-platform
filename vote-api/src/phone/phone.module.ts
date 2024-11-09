import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneTypeController } from './phone_type.controller';
import { PhoneService } from './phone.service';
import { AuthModule } from 'auth/auth.module';
import { PhoneTypeEntity } from './entities/phone_type.entity';
import { LocalizationModule } from 'localization/localization.module';
import { PhoneUserController } from './phone_user.controller';
import { PhoneEntity } from './entities/phone.entity';
import { UsersModule } from 'users/users.module';
import { OrganizationModule } from 'organization/organization.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([PhoneTypeEntity,
                              PhoneEntity
                            ]),
    AuthModule,
    //forwardRef(() => AuthModule),
    LocalizationModule,
    UsersModule,
    OrganizationModule,
  ],
  controllers: [PhoneTypeController, PhoneUserController],
  providers:   [PhoneService], //, JwtService],
  exports: [PhoneService]
})
export class PhoneModule { }
