
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalEntityService } from './legal_entity.service';
import { AuthModule } from 'auth/auth.module';
import { LegalEntityEntity } from './entities/legal_entity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LegalEntityEntity]),
    forwardRef(() => AuthModule),
  ],
  providers:   [LegalEntityService], 
  exports: [LegalEntityService]
})
export class LegalEntityModule { }

