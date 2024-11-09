

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddyService } from './addy.service';
import { AuthModule } from 'auth/auth.module';
import { AddyEntity } from './entities/addy.entity';
import { LocalizationModule } from 'localization/localization.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([AddyEntity]),
    forwardRef(() => AuthModule),
    LocalizationModule,
  ],
  providers:   [AddyService], 
  exports: [AddyService]
})
export class AddyModule { }

