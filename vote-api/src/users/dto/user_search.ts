
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Address } from 'addy/dto/address';
import { LocalizedUniversalStatus } from 'status/dto/universal_status.dto';


export class UserSearchParameters {
}

export class UserSearchFilters {
}

export class UserSearchPagination {
    @ApiProperty({ description: 'Page number. Valid range: 1 - n', example: 1})
    page: number;
    @ApiProperty({ description: 'Number of items per page', example: 10})
    per_page: number;
}

export enum UserSearchOrderByField {
    CREATED_AT = 'created_at',
    NAME_DISPLAY_LAST = 'name_display_last',
    NAME_LEGAL_LAST = 'name_legal_last',
    EMAIL = 'email'
}
export class UserSearchOrderBy {
    @ApiProperty({ description: 'Field to order by. Default: user account creation date', enum: UserSearchOrderByField})
    field: UserSearchOrderByField;
    @ApiProperty({ description: 'ascendent (true) or descendent (false) order'})
    ascendent: boolean;
}

export class UserSearchRequest {
    @ApiPropertyOptional({ description: 'Search parameters', type: UserSearchParameters})
    parameters?: UserSearchParameters;
    @ApiPropertyOptional({ description: 'Search filters', type: UserSearchFilters})
    filters?: UserSearchFilters;
    @ApiPropertyOptional({ description: 'Search pagination', type: UserSearchPagination})
    pagination?: UserSearchPagination;    
    @ApiPropertyOptional({ description: 'Search order', type: UserSearchOrderBy})
    order?: UserSearchOrderBy;    
}


export class UserSearchResultItem {
    @ApiProperty({ description: 'User id', example: 217})
    id: string;
    @ApiProperty({ description: 'User email', example: 'joan@savimbo.com'})
    email: string;
    @ApiProperty({ description: 'User first legal name', example: 'Joan'})
    name_legal_first: string;
    @ApiProperty({ description: 'User last legal name', example: 'Smith'})
    name_legal_last: string;
    @ApiProperty({ description: 'User first name to display', example: 'Joannie'})
    name_display_first: string;
    @ApiProperty({ description: 'User last name to display', example: 'Smith'})
    name_display_last: string;
    @ApiProperty({ description: 'User account creation date', example: '2021-01-01T00:00:00.000Z'})
    createdAt: Date;
    @ApiProperty({ description: 'Flagged by staff'})
    flagged: boolean;
    @ApiProperty({ description: 'User profile icon URL'})
    icon_url: string;
    @ApiProperty({ description: 'User address', type: Address})
    address: Address;  
    @ApiProperty({ description: 'User account status', type: LocalizedUniversalStatus})
    status: LocalizedUniversalStatus; 
}

export class UserSearchResult {
    @ApiProperty({ description: 'Users found', type: UserSearchResultItem})
    users: UserSearchResultItem[] = [];
    @ApiProperty({ description: 'Total number of users found', example: 23})
    total: number;
}