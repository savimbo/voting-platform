

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from 'constants/error-code';
import { LangEntity } from './entities/lang.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// An object that needs to have the fields lang_id and name and then anything else
interface Translations {
    lang_id: string;
    name: string;
    [key: string]: any;
}

@Injectable()
export class LangService {
    constructor(
        @InjectRepository(LangEntity)
        private langRepository: Repository<LangEntity>
    ) { }
    
    async findAll(): Promise<LangEntity[]> {
        return await this.langRepository.find();
    }
    
    async findOneBy3LetterCode(code: string): Promise<LangEntity> {
        const lower_code = code.toLowerCase();
        return await this.langRepository.findOneBy({ code_3letter: lower_code });
    }

    

    getTranslation(translations:Translations[], lang_id:string): string {
        const translation = translations.find(t => t.lang_id == lang_id);
        if (translation)
            return translation.name;
        else {
            if (lang_id == 'spa') {
                return this.getTranslation(translations, 'eng');
            }
            else if (lang_id == 'con') {
                return this.getTranslation(translations, 'spa');
            }
            return "Name not found";
        } 
    }
    
}
