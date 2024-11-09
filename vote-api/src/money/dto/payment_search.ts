import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocalizedUniversalStatus } from 'status/dto/universal_status.dto';
import { UserProfileSummary } from 'users/dto/user-profile';


export class PaymentSearchParameters {
    @ApiProperty({ description: 'Id of the user or null for all payments', example: '8xTJiGaaU243'})
    beneficiaryId: string | null;
}

export class PaymentSearchFilters {
}

export class PaymentSearchPagination {
    @ApiProperty({ description: 'Page number. Valid range: 1 - n', example: 1})
    page: number;
    @ApiProperty({ description: 'Number of items per page', example: 10})
    per_page: number;
}

export enum PaymentSearchOrderByField {
    CREATED_AT = 'created_at',
    DUE_AT = 'due_at',
    AMOUNT = 'amount',
}
export class PaymentSearchOrderBy {
    @ApiProperty({ description: 'Field to order by. Default: Payment account creation date', enum: PaymentSearchOrderByField})
    field: PaymentSearchOrderByField;
    @ApiProperty({ description: 'ascendent (true) or descendent (false) order'})
    ascendent: boolean;
}

export class PaymentSearchRequest {
    @ApiPropertyOptional({ description: 'Search parameters', type: PaymentSearchParameters})
    parameters: PaymentSearchParameters;
    @ApiPropertyOptional({ description: 'Search filters', type: PaymentSearchFilters})
    filters?: PaymentSearchFilters;
    @ApiPropertyOptional({ description: 'Search pagination', type: PaymentSearchPagination})
    pagination?: PaymentSearchPagination;    
    @ApiPropertyOptional({ description: 'Search order', type: PaymentSearchOrderBy})
    order?: PaymentSearchOrderBy;    
}


export class PaymentSearchResultItem {
    @ApiProperty({ description: 'Payment id', example: '9EuJiGa552h6'})
    id: string;
    @ApiProperty({ description: 'Payment amount', example: '52.15'})
    amount: string
    @ApiProperty({ description: 'Payment currency (ISO 4217 code)', example: 'USD'})
    currency: string;
    @ApiProperty({ description: 'Payment account creation date', example: '2021-01-01T00:00:00.000Z'})
    createdAt: Date;
    @ApiProperty({ description: 'Payment account due date', example: '2021-01-01T00:00:00.000Z'})
    dueAt: Date | null = null
    @ApiProperty({ description: 'Payment account completion date', example: '2021-01-01T00:00:00.000Z'})
    completedAt: Date | null = null
    @ApiProperty({ description: 'Payment status', type: LocalizedUniversalStatus})
    status: LocalizedUniversalStatus;
    @ApiProperty({ description: 'User who received the payment or null', type: UserProfileSummary})
    user: UserProfileSummary  | null = null
    @ApiProperty({ description: 'Id of the entity that made the payment or null', example: '9EuJiGa552h6'})
    disburser_id : string | null
    @ApiProperty({ description: 'Payment description'})
    description : string
    @ApiProperty({ description: 'Payout operation associated to this payment', example: '9EuJiGa552h6'})
    payout_id: string | null
}

export class PaymentSearchResult {
    @ApiProperty({ description: 'Payments found', type: PaymentSearchResultItem})
    payments: PaymentSearchResultItem[] = [];
    @ApiProperty({ description: 'Total number of payments found', example: 23})
    total: number;
}