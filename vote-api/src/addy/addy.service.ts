
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddyEntity } from './entities/addy.entity';
import { Address } from './dto/address';
import { CountryService } from 'localization/country.service';
import { StateService } from 'localization/state.service';

@Injectable()
export class AddyService {
    constructor(
        @InjectRepository(AddyEntity)
        private addyRepository: Repository<AddyEntity>,
        private countryService: CountryService,
        private stateService: StateService,
    ) { }


    async upsertAddy(addy : AddyEntity) : Promise<AddyEntity> {
        const newAddy = await this.addyRepository.save(addy);
        return newAddy;
    }

    async AddressFromAddyEntity(addy: AddyEntity, lang: string) : Promise<Address> {
        const stateResponse = await this.stateService.findState(addy.state_code, lang); 
        const countryResponse = await this.countryService.findCountry(addy.country_code, lang); 
        const address = Address.createAddressFromAddyEntity(addy, stateResponse, countryResponse);
        return address;
    }

    async AddressFromFullyPopulatedAddyEntity(addy: AddyEntity, lang: string) : Promise<Address> {
        const stateResponse = addy.state ? this.stateService.responseFromEntity(addy.state, lang) : null; 
        const countryResponse = addy.country ? this.countryService.responseFromEntity(addy.country, lang) : null; 
        const address = Address.createAddressFromAddyEntity(addy, stateResponse, countryResponse);
        return address;
    }

    async updateAddyEntityFromAddress(addyData: Address) : Promise<AddyEntity> {
        const addyEntity = Address.createAddyEntityFromAddress(addyData);
        const ret = await this.upsertAddy(addyEntity);
        return ret;
    }
}
