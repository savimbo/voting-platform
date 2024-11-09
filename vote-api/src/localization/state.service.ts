import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from 'constants/error-code';
import { StateEntity } from './entities/state.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StateResponse } from './dto/state.response';
import { LangService } from './lang.service';
import c from 'config';

@Injectable()
export class StateService {
    constructor(
        @InjectRepository(StateEntity)
        private stateRepository: Repository<StateEntity>,
        private langService: LangService
    ) { }

    responseFromEntity(state: StateEntity, lang_id : string): StateResponse {
        const response : StateResponse = {
            code :                  state.code,
            code_subdivision :      state.code_subdivision,
            localized_name :        this.langService.getTranslation(state.tx, lang_id),
        }
        return response;
    }
    
    async findAllStates(countryId: string, user_lang: string): Promise<StateResponse[]> {
        console.log(countryId);
        const states = await this.stateRepository.find({ 
                                    where: { country_code_alpha3: countryId },
                                    relations: { tx: true } 
                                });
        const ret = states.map(state => this.responseFromEntity(state, user_lang));
        ret.sort((a, b) => a.localized_name.localeCompare(b.localized_name));
        return ret;
    }

    async findState(code:string, user_lang: string): Promise<StateResponse> {
        if (!code) {
            return null;
        }
        const state = await this.stateRepository.findOne({ 
                                                        where: { code: code}, 
                                                        relations: { tx: true } 
                                                        });
        return this.responseFromEntity(state, user_lang);
    }

    
}
