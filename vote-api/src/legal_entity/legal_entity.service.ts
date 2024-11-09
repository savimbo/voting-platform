

import { BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { LegalEntityEntity } from './entities/legal_entity.entity';
import { SavimboUid } from 'util/savimbo-uids';

@Injectable()
export class LegalEntityService {
    constructor(
        @InjectRepository(LegalEntityEntity)
        private repository: Repository<LegalEntityEntity>,
    ) { }


    private async findById(id: string): Promise<LegalEntityEntity> {
        return await this.repository.findOneBy({ id: id });
      }
    
    async createLegalEntity(legal : LegalEntityEntity) : Promise<LegalEntityEntity> {
        if (!legal.id) {
            legal.id = SavimboUid.generate();
        }
        
        let legEntity: InsertResult = null;
        let times = 0;
        let success = false;
        while(!success) {
        try{
            legEntity = await this.repository.insert(legal);
            success = true;
        }
        catch (error: any) {
            if (error.code === '23505') { // restriccion de unicidad: retry
                legal.id = SavimboUid.generate();
                times++;
                console.log('Error creando org: unique constrain. Retrying');
            }
            else {
                console.error('Error creando legal entity:', error);
                throw new BadRequestException('Error creating legal entity');
            }
            if (times == 5) {
                console.error('Error creando org:', error);
                throw new ConflictException('Error creating legal entity');
            }
        } 
        //finally {  }
        }
        
        const ret = await this.findById(legal.id);
        return ret;
    }


}
