
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from 'constants/error-code';
import { PhoneTypeEntity } from './entities/phone_type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneTypeResponse } from './dto/phone_type.response';
import { LangService } from 'localization/lang.service';
import { Phone } from './dto/phone';
import { PhoneEntity } from './entities/phone.entity';
import { IsEmptyString } from 'util/basic-utils';
import { UsersService } from 'users/users.service';
import { LegalEntityEntity } from 'legal_entity/entities/legal_entity.entity';
import { OrganizationService } from 'organization/organization.service';

@Injectable()
export class PhoneService {
    constructor(
        @InjectRepository(PhoneTypeEntity)
        private phone_typeRepository: Repository<PhoneTypeEntity>,
        @InjectRepository(PhoneEntity)
        private phoneRepository: Repository<PhoneEntity>,
        private langService: LangService,
        private userService: UsersService,
        private organizationService: OrganizationService,
    ) { }

   
    private async phoneResponseFromPhoneEntity(phoneEntity: PhoneEntity, lang: string, solveRelations: boolean): Promise<Phone> {
        const phoneTypeResponse = solveRelations ? 
                                    await this.findPhoneTypeByUid(phoneEntity.phone_type_uid, lang) :
                                    this.phoneTypeResponseFromPhoneTypeEntity(phoneEntity.phone_type, lang);
        const response : Phone = {
            id:                     phoneEntity.id,
            number:                 phoneEntity.number,
            number_as_entered:      phoneEntity.number_as_entered,
            extension:              phoneEntity.extension,
            country_calling_code:   phoneEntity.country_calling_code,
            phone_type:             phoneTypeResponse
        }
        return response;
    }

    private async updatePhoneForLegalEntity(phoneId: number, phone : Phone, lang : string, legal: LegalEntityEntity, byUser: string) : Promise<Phone> {
        const updatedPhone : PhoneEntity = { 
            id:                     phone.id,
            number:                 phone.number.replace(/\s+/g, ''), // remove all spaces
            number_as_entered:      IsEmptyString(phone.number_as_entered) ? phone.number : phone.number_as_entered,
            extension:              phone.extension,
            country_calling_code:   phone.country_calling_code,
            phone_type_uid:         phone.phone_type.uid,
            legalEntity:            [ legal ],  
            updated_by:             byUser,
            updated_at:             new Date(),  // typeorm might do this automatically but the property updated_at is defined as "must exist"
        }

        const savedPhone = await this.phoneRepository.save(updatedPhone);
        return await this.phoneResponseFromPhoneEntity(savedPhone, lang, true);
    }

    async updatePhoneForUser(phoneId: number, phone : Phone, lang : string, forUser: string, byUser: string) : Promise<Phone> {
        const legal = await this.userService.getUserLegalEntity(forUser);
        return await this.updatePhoneForLegalEntity(phoneId, phone, lang, legal, byUser)
    }

    private async createPhoneForLegalEntity(phone : Phone, lang : string, legal: LegalEntityEntity, byUser: string) : Promise<Phone> {
        const newPhone : PhoneEntity = { 
            id:                     -1,
            number:                 phone.number.replace(/\s+/g, ''), // remove all spaces
            number_as_entered:      IsEmptyString(phone.number_as_entered) ? phone.number : phone.number_as_entered,
            extension:              phone.extension,
            country_calling_code:   phone.country_calling_code,
            phone_type_uid:         phone.phone_type.uid,
            legalEntity:            [ legal ],  
            updated_by:             byUser,
            created_by:             byUser,
            created_at:             new Date(),
            updated_at:             new Date()
        }

        const savedPhone = await this.phoneRepository.save(newPhone);
        return await this.phoneResponseFromPhoneEntity(savedPhone, lang, true);
    }

    async createPhoneForUser(phone : Phone, lang : string, forUser: string, byUser: string) : Promise<Phone> {
        const legal = await this.userService.getUserLegalEntity(forUser);
        return await this.createPhoneForLegalEntity(phone, lang, legal, byUser);
    }

    private async findAllPhonesForLegalEntity(lang : string, legalEntityId: string) : Promise<Phone[]> {
        const phoneEntities = await this.phoneRepository.createQueryBuilder('phone')
                        .where(qb => {
                            const subQuery = qb.subQuery()
                                .select('phone_legal_entity.phoneId')
                                .from('phone_legal_entity', 'phone_legal_entity')
                                .where('phone_legal_entity.legalEntityId = :legalEntityId')
                                .getQuery();
                            return 'phone.id IN ' + subQuery;
                            })
                            .setParameter('legalEntityId', legalEntityId)
                            .getMany();

                            const phoneResPromises = phoneEntities.map(phone => this.phoneResponseFromPhoneEntity(phone, lang, true));
        const phoneResResults = await Promise.all(phoneResPromises);
        return phoneResResults;
    }

    async findAllPhonesForUser(lang : string, forUser: string, byUser: string) : Promise<Phone[]> {
        const legal = await this.userService.getUserLegalEntity(forUser);
        return await this.findAllPhonesForLegalEntity(lang, legal.id);
    }

    private phoneTypeResponseFromPhoneTypeEntity(phone_type: PhoneTypeEntity, lang_id : string): PhoneTypeResponse {
        const response : PhoneTypeResponse = {
            uid :               phone_type.uid,
            localized_name :    this.langService.getTranslation(phone_type.tx, lang_id)
        }
        return response;
    }

    async findPhoneTypeByUid(uid: string, user_lang: string): Promise<PhoneTypeResponse> {
        const phoneType = await this.phone_typeRepository.findOne({ where: {uid: uid},
                                                                    relations: ['tx'] });
        return this.phoneTypeResponseFromPhoneTypeEntity(phoneType, user_lang);
    }
    
    async findAllPhoneTypes(user_lang: string): Promise<PhoneTypeResponse[]> {
        const phoneTypes = await this.phone_typeRepository.find({ relations: { tx: true } });
        return phoneTypes.map(phone_type => this.phoneTypeResponseFromPhoneTypeEntity(phone_type, user_lang));
    }

    
}
