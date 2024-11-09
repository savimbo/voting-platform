import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from 'constants/error-code';
import { CountryEntity } from './entities/country.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryResponse } from './dto/country.response';
import { LangService } from './lang.service';

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(CountryEntity)
        private countryRepository: Repository<CountryEntity>,
        private langService: LangService
    ) { }

    private debugDump(countrys: CountryEntity[]) {
        countrys.forEach((country) => {
            console.log(`tx para ${country.code_alpha3} ${country.national_flag_char}: ${country.tx.length}`);
            country.tx.forEach((tx) => {
                console.log(`  tx para ${country.code_alpha3}: ${tx.name}`);
            });
            country.calling_codes.forEach((cc) => {
                console.log(`  cc para ${country.code_alpha3}: ${cc.code}`);
            });
        });
    
    }

    responseFromEntity(country: CountryEntity, lang_id : string): CountryResponse {
        const response : CountryResponse = {
            code_alpha3 :           country.code_alpha3,
            national_flag_char :    country.national_flag_char,
            localized_name :        this.langService.getTranslation(country.tx, lang_id),
            calling_code :          country.calling_codes ? country.calling_codes.map(cc => cc.code) : null
        }
        return response;
    }
    
    async findAllCountrys(user_lang: string): Promise<CountryResponse[]> {
        const countries = await this.countryRepository.find({ relations: { tx: true, calling_codes: true} });
        return countries.map(country => this.responseFromEntity(country, user_lang));
    }

    async findCountry(code_alpha3:string, user_lang: string): Promise<CountryResponse> {
        if (!code_alpha3 || code_alpha3.length != 3) {
            return null;
        }
        const country = await this.countryRepository.findOne({ 
                                                                where: { code_alpha3: code_alpha3}, 
                                                                relations: { tx: true, calling_codes: true} 
                                                            });
        return this.responseFromEntity(country, user_lang);
    }

    
}
