import { ApiProperty } from '@nestjs/swagger';
import { StateEntity } from 'localization/entities/state.entity';

export class StateResponse {
    @ApiProperty({ description: 'State code', example: 'CO-PUT' })
    code: string;

    @ApiProperty({ description: 'State subdivision', example: 'PUT' })
    code_subdivision: string;
  
    @ApiProperty({ description: 'The name of the state in the user language', example: 'Putumayo' })
    localized_name: string;

  }
  