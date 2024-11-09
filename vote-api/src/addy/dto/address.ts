
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddyEntity } from 'addy/entities/addy.entity';
import { CountryResponse } from 'localization/dto/country.response';
import { StateResponse } from 'localization/dto/state.response';


export class Address {
    @ApiProperty({ description: 'The unique identifier of the address', example: 211 })
    id: number;

    @ApiPropertyOptional({ description: '', example: "" })
    formatted_address: string;

    @ApiPropertyOptional({ description: '', example: "" })
    fuzzy_address: string;

    @ApiPropertyOptional({ description: '', example: "" })
    street: string;

    @ApiPropertyOptional({ description: '', example: "" })
    extended: string;

    @ApiPropertyOptional({ description: '', example: "" })
    city: string;

    @ApiPropertyOptional({ description: '', example: "" })
    postal_code: string;

    @ApiPropertyOptional({ description: '', example: "" })
    state_code: string;

    @ApiPropertyOptional({ description: '', example: "" })
    country_code: string;

    @ApiPropertyOptional({ description: '', example: "" })
    google_place_id: string;

    @ApiPropertyOptional({ description: '', example: "" })
    google_place_type: string;

    @ApiPropertyOptional({ description: '', example: "" })
    google_plus_code: string;

    @ApiPropertyOptional({ description: '', type: StateResponse })
    state: StateResponse;

    @ApiPropertyOptional({ description: '', type: CountryResponse })
    country: CountryResponse;

    static createAddressFromAddyEntity(addy: AddyEntity, stateResponse : StateResponse, countryResponse: CountryResponse): Address {
        const address = new Address();
        address.id = addy.id;
        address.formatted_address = addy.formatted_address;
        address.fuzzy_address = addy.fuzzy_address;
        address.street = addy.street;
        address.extended = addy.extended;
        address.city = addy.city;
        address.postal_code = addy.postal_code;
        address.google_place_id = addy.google_place_id;
        address.google_place_type = addy.google_place_type;
        address.google_plus_code = addy.google_plus_code;
        address.state = stateResponse;
        address.country = countryResponse;
        return address;
    }

    static createAddyEntityFromAddress(addyData: Address): AddyEntity {
        const addyEntity = new AddyEntity();
        addyEntity.id = addyData.id;
        addyEntity.formatted_address = addyData.formatted_address;
        addyEntity.fuzzy_address = addyData.fuzzy_address;
        addyEntity.street = addyData.street;
        addyEntity.extended = addyData.extended;
        addyEntity.city = addyData.city;
        addyEntity.postal_code = addyData.postal_code;
        addyEntity.state_code = addyData.state.code;
        addyEntity.country_code = addyData.country.code_alpha3;
        addyEntity.google_place_id = addyData.google_place_id;
        addyEntity.google_place_type = addyData.google_place_type;
        addyEntity.google_plus_code = addyData.google_plus_code;
        return addyEntity;
    }
    
}
