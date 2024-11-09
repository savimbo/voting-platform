import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class NewIncome {
    @ApiProperty({ description: 'Recipient legal entity id', example: '9EuJiGa552h6'})
    recipientId: string;    
    @ApiProperty({ description: 'Amount', example: '52.15'})
    amount: string
    @ApiProperty({ description: 'Currency (ISO 4217 code)', example: 'USD'})
    currency: string;

    @ApiProperty({ description: 'Description', example: 'Payment for services rendered'})
    description: string;
}

