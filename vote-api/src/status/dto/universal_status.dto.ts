
import { ApiProperty } from '@nestjs/swagger';

export class LocalizedUniversalStatus {
    @ApiProperty({ description: 'The status id', example: "2" })
    id: number;
  
    @ApiProperty({ description: 'The name of the status in the user language', example: 'Active' })
    localized_name: string;
  
  }
  