
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhoneTypeResponse } from './phone_type.response';

export class Phone {
    @ApiProperty({ description: 'The unique identifier of the phone', example: 211 })
    id: number;

    @ApiProperty({ description: 'Local number of the phone', example: "666555222" })
    number: string;

    @ApiPropertyOptional({ description: 'Local number in the format received by the service', example: "666 555 222" })
    number_as_entered: string;

    @ApiPropertyOptional({ description: 'Extension', example: "12" })
    extension: string;

    @ApiProperty({ description: 'International dialing code', example: "ES+34" })
    country_calling_code: string;

    @ApiProperty({ description: 'Type of phone number'})
    phone_type: PhoneTypeResponse;

    
}
