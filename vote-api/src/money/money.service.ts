import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavimboUid } from 'util/savimbo-uids';
import { OrgPayoutEntity, PayoutEntity, UserPayoutEntity } from './entities/payout.entity';
import { PaymentSearchOrderByField, PaymentSearchRequest, PaymentSearchResult, PaymentSearchResultItem } from './dto/payment_search';
import { LegalEntityEntity } from 'legal_entity/entities/legal_entity.entity';
import { UserEntity } from 'users/entities/user.entity';
import { UniversalStatusEntity } from 'status/entities/universal_status.entity';
import { UniversalStatusTxEntity } from 'status/entities/universal_status_tx.entity';
import { UserProfileSummary } from 'users/dto/user-profile';
import { LocalizedUniversalStatus } from 'status/dto/universal_status.dto';
import { IsEmptyString } from 'util/basic-utils';
import { NewIncome } from './dto/income';
import { MoneyAccountEntity } from './entities/money_account.entity';
import { BeneficiaryIncomeEntity, OrgIncomeEntity, UserIncomeEntity } from './entities/income.entity';
import { UsersService } from 'users/users.service';
import { UniversalStatus } from 'status/model/universal_status.class';
import { distributeAmount, distributeDecimalAmount } from './model/money_arithmetics';
import Decimal from 'decimal.js';
import { StripeService } from './stripe.service';
import { Repository } from 'typeorm';
import { OrganizationService } from 'organization/organization.service';

@Injectable()
export class MoneyService {
    constructor(
        
        @InjectRepository(PayoutEntity)
        private payoutRepo: Repository<PayoutEntity>,
        @InjectRepository(UserPayoutEntity)
        private userPayoutRepo: Repository<UserPayoutEntity>,
        @InjectRepository(OrgPayoutEntity)
        private orgPayoutRepo: Repository<OrgPayoutEntity>,
        @InjectRepository(UserIncomeEntity)
        private userIncomeRepo: Repository<UserIncomeEntity>,
        @InjectRepository(OrgIncomeEntity)
        private orgIncomeRepo: Repository<OrgIncomeEntity>,
        @InjectRepository(BeneficiaryIncomeEntity)
        private incomeRepo: Repository<BeneficiaryIncomeEntity>,
        @InjectRepository(MoneyAccountEntity)
        private moneyAccountRepo: Repository<MoneyAccountEntity>,
        private userService: UsersService,
        private stripeService: StripeService,
        private organizationService: OrganizationService
    ) { }

// #region search income
    
    async searchIncome(params: PaymentSearchRequest, byUser: string, lang: string): Promise<PaymentSearchResult> {
        let skip = 0; // (page - 1) * pageSize;
        let take = 20; // pageSize;
        let orderField = PaymentSearchOrderByField.CREATED_AT;
        let orderAsc = false;

        if (params && params.pagination) {
            skip = (params.pagination.page - 1) * params.pagination.per_page;
            take = params.pagination.per_page;
        }
        if (params && params.order) {
            orderField = params.order.field;
            orderAsc = params.order.ascendent;
        }

        console.log('skip:', skip, 'take:', take, 'orderField:', orderField, 'orderAsc:', orderAsc);

        let queryBase = this.incomeRepo
        .createQueryBuilder('income')
        .leftJoin(LegalEntityEntity, 'legalEntity', 'legalEntity.id = income.recipient_id')
        //.leftJoin(OrganizationEntity, 'organization', 'organization.legal_entity_id = legalEntity.id')
        .leftJoin(UserEntity, 'user', 'user.legal_entity_id = legalEntity.id')
        .leftJoin("user_payment", "payment", "payment.income_id = income.id")
        .leftJoin(UserPayoutEntity, 'user_payout', 'user_payout.id = payment.payout_id')
        .leftJoin(UniversalStatusEntity, 'status', 'status.id = user_payout.status_id')
        .leftJoin(UniversalStatusTxEntity, 'statustx', 'status.id = statustx.status_id AND statustx.lang_id = :lang', { lang: lang })

        if (!IsEmptyString(params.parameters.beneficiaryId)) {
            queryBase = queryBase.where('income.recipient_id = :recipientId', { recipientId: params.parameters.beneficiaryId })
        }

        const queryCount = queryBase.clone()
        .select('income.id')

        const queryData = queryBase
        .select([
            'income.id AS income_id',  // alias (as) must be in lowercase! 
            'income.amount AS income_amount',
            'income.currency AS income_currency',
            'income.created_at AS income_created_at',  // created_at (column) or createdAt (property) ?? 
            'income.disburser_id AS income_disburser_id',
            'income.description AS income_description',
            'income.is_kapital_program AS income_is_kapital_program',
            'income.savimbo_program AS income_savimbo_program',

            'user_payout.id',
            'user_payout.due_at AS user_payout_due_at',
            'user_payout.completed_at AS user_payout_completed_at',

            'legalEntity.personality AS entity_personality',
            'user.id AS user_id',
            'user.name_display_first AS user_name_display_first',
            'user.name_display_last AS user_name_display_last',
            'status.id AS status_id',
            'statustx.name AS status_name', 
        ])
        // pagination
        .offset(skip)
        .limit(take)
        .orderBy(this.getOrderByField(orderField), orderAsc ? 'ASC' : 'DESC')

        const incomes = await queryData.getRawMany();
        const total = await queryCount.getCount();

        console.log("incomes:", incomes);

        return this.searchIncomesResultToPaymentResult(incomes, total);
    } 
    
    private looseLastZero(cadena: string): string {
        const regexTresDecimales = /\.\d{3}$/;  // check if ends with 3 decimals
    
        if (regexTresDecimales.test(cadena)) {
            if (cadena[cadena.length - 1] === '0') {   // is last character a '0'?
                return cadena.slice(0, -1); // drop it
            }
        }
        return cadena; // return the original string otherwise
    }

    private mapSearchIncomeResultToPaymentResultItem(record: any) : PaymentSearchResultItem {
        const ret = new PaymentSearchResultItem();
        ret.id = record.income_id as string;
        ret.amount = this.looseLastZero(record.income_amount as string)
        ret.currency = record.income_currency as string;
        ret.dueAt = record.user_payout_due_at as Date;
        ret.createdAt = record.income_created_at as Date;
        ret.completedAt = record.user_payout_completed_at as Date;
        ret.disburser_id = record.income_disburser_id as string;
        ret.description = record.income_description as string;
        ret.payout_id = record.user_payout_id as string;

        if (record.entity_personality === 'user') {
          ret.user = new UserProfileSummary(); 
          ret.user.id                 = record.user_id as string;
          ret.user.email              = ""
          ret.user.name_legal_first   = ""
          ret.user.name_legal_last    = ""
          ret.user.name_display_first = record.user_name_display_first as string;
          ret.user.name_display_last  = record.user_name_display_last as string;
          ret.user.icon_url           = ""
        }
        ret.status = new LocalizedUniversalStatus();
        ret.status.id = record.status_id as number;
        ret.status.localized_name = record.status_name as string;
        return ret;
    }

    private searchIncomesResultToPaymentResult(payments: any, total: number): PaymentSearchResult {
        const ret = new PaymentSearchResult();
        ret.total = total;
        ret.payments = payments.map((p: any) => {
            return this.mapSearchIncomeResultToPaymentResultItem(p);
        });
        return ret
    }
    

// #region search payouts    

    async searchPayouts(params: PaymentSearchRequest, byUser: string, lang: string): Promise<PaymentSearchResult> {
        let skip = 0; // (page - 1) * pageSize;
        let take = 20; // pageSize;
        let orderField = PaymentSearchOrderByField.CREATED_AT;
        let orderAsc = false;

        if (params && params.pagination) {
            skip = (params.pagination.page - 1) * params.pagination.per_page;
            take = params.pagination.per_page;
        }
        if (params && params.order) {
            orderField = params.order.field;
            orderAsc = params.order.ascendent;
        }

        //let payments = await this.userPaymentRepo
        let query = this.userPayoutRepo
        .createQueryBuilder('payment')
        .leftJoin(LegalEntityEntity, 'legalEntity', 'legalEntity.id = payment.recipient_id')
        .leftJoin(UserEntity, 'user', 'user.legal_entity_id = legalEntity.id')
        .leftJoin(UniversalStatusEntity, 'status', 'status.id = payment.status_id')
        .leftJoin(UniversalStatusTxEntity, 'statustx', 'status.id = statustx.status_id AND statustx.lang_id = :lang', { lang: lang })

        if (!IsEmptyString(params.parameters.beneficiaryId)) {
            query = query.where('payment.recipient_id = :recipientId', { recipientId: params.parameters.beneficiaryId })
        }

        query = query
        .select([
            'payment.id AS payment_id',  // alias (as) must be in lowercase! 
            'payment.amount AS payment_amount',
            'payment.created_at AS payment_created_at',  // created_at (column) or createdAt (property) ?? 
            'payment.due_at AS payment_due_at',
            'payment.currency AS payment_currency',
            'payment.completed_at AS payment_completed_at',
            'legalEntity.personality AS entity_personality',
            'user.id AS user_id',
            'user.name_display_first AS user_name_display_first',
            'user.name_display_last AS user_name_display_last',
            'status.id AS status_id',
            'statustx.name AS status_name', 
        ])
        // pagination
        .skip(skip)
        .take(take)
        // order by
        .orderBy(this.getOrderByField(orderField), orderAsc ? 'ASC' : 'DESC')

        const payments = await query.getRawMany();
        return this.searchResultToPaymentResult(payments);
    }

    private mapSearchResultToPaymentResult(payment: any) : PaymentSearchResultItem {
        const ret = new PaymentSearchResultItem();
        ret.id = payment.payment_id as string;
        ret.amount = payment.payment_amount as string;
        ret.currency = payment.payment_currency as string;
        ret.dueAt = payment.payment_due_at as Date;
        ret.createdAt = payment.payment_created_at as Date;
        ret.completedAt = payment.payment_completed_at as Date;
        if (payment.entity_personality === 'user') {
          ret.user = new UserProfileSummary(); 
          ret.user.id                 = payment.user_id as string;
          ret.user.email              = ""
          ret.user.name_legal_first   = ""
          ret.user.name_legal_last    = ""
          ret.user.name_display_first = payment.user_name_display_first as string;
          ret.user.name_display_last  = payment.user_name_display_last as string;
          ret.user.icon_url           = ""
        }
        ret.status = new LocalizedUniversalStatus();
        ret.status.id = payment.status_id as number;
        ret.status.localized_name = payment.status_name as string;
        return ret;
    }

    private searchResultToPaymentResult(payments: any): PaymentSearchResult {
        const ret = new PaymentSearchResult();
        ret.total = payments.length;
        ret.payments = payments.map((p: any) => {
            return this.mapSearchResultToPaymentResult(p);
        });
        return ret
    }

    private getOrderByField(orderBy: PaymentSearchOrderByField): string {
        switch (orderBy) {
          case PaymentSearchOrderByField.CREATED_AT:
            return 'income.createdAt';
          case PaymentSearchOrderByField.DUE_AT:
            return 'payout.dueAt';
          case PaymentSearchOrderByField.AMOUNT:
            return 'income.amount';
          default:
            return 'income.createdAt';
        }
    }

// #region create payout
    async createUserPayout(legalEntityId: string, amount: string, currency: string, byUser: string, lang: string): Promise<UserPayoutEntity> {
        const payment = new UserPayoutEntity()
        payment.id = SavimboUid.generate();
        payment.amount = amount;
        payment.currency = currency;
        payment.created_by = byUser;
        payment.updated_by = byUser;
        payment.dueAt = new Date();
        payment.completedAt = null;
        payment.result = ""
        payment.recipient = {... new LegalEntityEntity(), id: legalEntityId }
        payment.moneyAccount = null;  // ToDo
        payment.status = { ... new UniversalStatusEntity(), id: UniversalStatus.Created }

        let times = 0;
        let success = false;
        while(!success) {
        try{
            await this.userPayoutRepo.insert(payment);
            success = true;
        }
        catch (error: any) {
            if (error.code === '23505') { // restriccion de unicidad: retry
                payment.id = SavimboUid.generate();
                times++;
                if (times == 10) {
                    console.error('Error creando payment:', error);
                    throw new ConflictException('Error creating payment');
                }
                console.log('Error creando payment: unique constrain. Retrying');
            }
            else {
                console.error('Error creando payment:', error);
                throw new BadRequestException('Error creating payment');
            }
        } 
        //finally {  }
        }
        return payment
    }

    async createPayoutForOrg(orgLegalEntityId: string, amount: string, currency: string, byUser: string, lang: string): Promise<void> {
        const members = await this.organizationService.getPayableMemberLegalEntities();
        // const { quotient, remainder } = distributeAmount(params.amount, params.currency, 3)
    }

// #region create income
    async createUserIncome( params: NewIncome, disburserId: string | null, payout: UserPayoutEntity | null, 
                            byUser: string, lang: string): Promise<UserIncomeEntity> {
        const income = new UserIncomeEntity()
        income.id = SavimboUid.generate();
        income.amount = params.amount;
        income.currency = params.currency;
        income.created_by = byUser;
        income.updated_by = byUser;
        //income.createdAt = new Date();
        //income.updatedAt = new Date();
        income.description = params.description;
        income.recipient = { ...new LegalEntityEntity(), id: params.recipientId }
        income.disburser = { ...new LegalEntityEntity(), id: disburserId }
        if (payout != null) {
            income.user_payouts = [payout]
        }

        let times = 0;
        let success = false;
        while(!success) {
        try{
            await this.userIncomeRepo.insert(income);
            success = true;
        }
        catch (error: any) {
            if (error.code === '23505') { // restriccion de unicidad: retry
                income.id = SavimboUid.generate();
                times++;
                console.log('Error creando income: unique constrain. Retrying');
            }
            else {
                console.error('Exception creando income:', error);
                throw new BadRequestException('Error creating income');
            }
            if (times == 10) {
                console.error('Error creando income:', error);
                throw new ConflictException('Error creating income');
            }
        } 
        //finally {  }
        }
        const ret = await this.userIncomeRepo.save(income); // to save the dependenc
        return income
    }

    async createOrgIncome(params: NewIncome, disburserId: string | null, byUser: string, lang: string): Promise<OrgIncomeEntity> {
        const income = new OrgIncomeEntity()
        income.id = SavimboUid.generate();
        income.amount = params.amount;
        income.currency = params.currency;
        income.created_by = byUser;
        income.updated_by = byUser;
        income.description = params.description;
        income.recipient = { ...new LegalEntityEntity(), id: params.recipientId }
        income.disburser = { ...new LegalEntityEntity(), id: disburserId }
        
        let times = 0;
        let success = false;
        while(!success) {
        try{
            await this.orgIncomeRepo.insert(income);
            success = true;
        }
        catch (error: any) {
            if (error.code === '23505') { // restriccion de unicidad: retry
                income.id = SavimboUid.generate();
                times++;
                console.log('Error creando income: unique constrain. Retrying');
            }
            else {
                console.error('Exception creando income:', error);
                throw new BadRequestException('Error creating income');
            }
            if (times == 10) {
                console.error('Error creando income:', error);
                throw new ConflictException('Error creating income');
            }
        } 
        //finally {  }
        }
        const ret = await this.orgIncomeRepo.save(income); // to save the dependenc
        return income
    }    

// #region payment
    async createUserPayment(params: NewIncome, disburserId: string | null, byUser: string, lang: string): Promise<void> {
        const payout = await this.createUserPayout(params.recipientId, params.amount, params.currency, byUser, lang)
        await this.createUserIncome(params, disburserId, payout, byUser, lang)
    }

// #region new income
    async newOrgIncome(params: NewIncome, byUser: string, lang: string): Promise<void> {
        const members = await this.organizationService.getPayableMemberLegalEntities();
        if (members.length == 0) {  // just create the income and that is
            const orgIncome = await this.createOrgIncome(params, null, byUser, lang)    
        }
        else {
            const { quotient, remainder } = distributeAmount(params.amount, params.currency, 3)
            let amountToDistribute = (new Decimal(quotient)).add(new Decimal(remainder))
            const memberDistribution = distributeDecimalAmount(amountToDistribute, params.currency, members.length)
            params.amount = memberDistribution.quotient
            for (const member of members) { 
                params.recipientId = member
                await this.createUserPayment(params, params.recipientId, byUser, lang)  
            }
        }
    }

    async newIncome(params: NewIncome, byUser: string, lang: string): Promise<void> {
        try {
            const user = await this.userService.getUserByLegalEntity(params.recipientId)
            if (user != null) {  // income for a user
                await this.createUserPayment(params, null, byUser, lang)
            }
            else {  // income for an org
                await this.newOrgIncome(params, byUser, lang)
            }
        }
        catch (error) {
            console.error('Error creating income:', error);
            throw new BadRequestException('Error creating income');
        }
    }
    
    
// #region pay    

    async payPayout(payoutId: string, byUser: string) : Promise<void> {
        let payout = await this.userPayoutRepo.findOne({
            where: { id: payoutId }, 
            relations: { recipient: true, 
                         user_incomes: true }
            });
        if (payout == null) {  
            payout = await this.orgPayoutRepo.findOne({
                where: { id: payoutId }, 
                relations: { recipient: true, 
                             org_incomes: true }
                });
        }
        if (payout == null) {  
            throw new NotFoundException(`Payout not found: ${payoutId}`);
        }
        const incomes = payout instanceof UserPayoutEntity ? payout.user_incomes : (payout as OrgPayoutEntity).org_incomes;
        const strIncomes = incomes.map((i) => i.id).join(', ')  // all incomes IDs separated by comma

        if (IsEmptyString(payout.recipient.default_money_account)){
            throw new ConflictException(`Recipient has no default money account: ${payout.recipient.id}`);
        }

        const payoutResult = await this.stripeService.payPayout(
                    payout.amount,
                    payout.currency,
                    payout.recipient.default_money_account,
                    incomes.length > 0 ? incomes[0].description : "",
                    payoutId, byUser, strIncomes, payout.recipient.id,
                    "") 

        payout.result = payoutResult.shortAnswer;
        if (payoutResult.success) {
            payout.completedAt = new Date();
            payout.status = { ... new UniversalStatusEntity(), id: UniversalStatus.Complete }
        }
        else {
            payout.status = { ... new UniversalStatusEntity(), id: UniversalStatus.Rejected }
            throw new BadRequestException('Error paying payout');
        }

    } 


}

