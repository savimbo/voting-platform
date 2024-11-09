
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhoneTypeResponse {
    @ApiProperty({ description: 'The unique label of the phone type', example: "cell" })
    uid: string;
  
    @ApiPropertyOptional({ description: 'The name of the phone type in the user language', example: 'Móvil' })
    localized_name: string;
  }
  