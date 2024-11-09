
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LangEntity } from './entities/lang.entity';
import { LangService } from './lang.service';
import { CountryController } from './country.controller';
import { StateController } from './state.controller';
import { CountryService } from './country.service';
import { StateService } from './state.service';
import { CountryEntity } from './entities/country.entity';
import { CountryCallingCodeEntity } from './entities/country_calling_code.entity';
import { AuthModule } from 'auth/auth.module';
import { StateEntity } from './entities/state.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([LangEntity]),
    TypeOrmModule.forFeature([CountryEntity]),
    TypeOrmModule.forFeature([StateEntity]),
    TypeOrmModule.forFeature([CountryCallingCodeEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CountryController, StateController],
  providers:   [LangService, CountryService, StateService], //, JwtService],
  exports: [LangService, CountryService, StateService]
})
export class LocalizationModule { }
