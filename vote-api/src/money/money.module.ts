
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { BeneficiaryIncomeEntity, OrgIncomeEntity, UserIncomeEntity } from './entities/income.entity';
import { OrgPayoutEntity, PayoutEntity, UserPayoutEntity } from './entities/payout.entity';
import { MoneyAccountEntity } from './entities/money_account.entity';
import { MoneyService } from './money.service';
import { MoneyController } from './money.controller';
import { UsersModule } from 'users/users.module';
import { StripeService } from './stripe.service';
import { OrganizationModule } from 'organization/organization.module';

//import { LocalizationModule } from 'localization/localization.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([BeneficiaryIncomeEntity, UserIncomeEntity, OrgIncomeEntity, 
                              PayoutEntity, UserPayoutEntity, OrgPayoutEntity, 
                              MoneyAccountEntity]),
    forwardRef(() => AuthModule),
    UsersModule,
    OrganizationModule
  ],
  controllers: [MoneyController],
  providers:   [MoneyService, StripeService], // services
  exports:     [MoneyService, StripeService]  // services
})
export class MoneyModule { }

