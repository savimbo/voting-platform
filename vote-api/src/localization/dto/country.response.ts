import { ApiProperty } from '@nestjs/swagger';
import { CountryEntity } from 'localization/entities/country.entity';

export class CountryResponse {
    @ApiProperty({ description: 'ISO 3166 Alpha3 country code', example: 'COL' })
    code_alpha3: string;

    @ApiProperty({ description: 'Unicode representation of the national flag', example: '🇨🇴' })
    national_flag_char: string;
  
    @ApiProperty({ description: 'The name of the country in the user language', example: 'Colombia' })
    localized_name: string;

    @ApiProperty({ description: 'International dialing code', example: ["CO+57"] })
    calling_code: string[];   
  

  }
  