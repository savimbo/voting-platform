import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ItemVoting {
    @ApiProperty({ description: 'The unique identifier of the item', example: 1 })
    @IsNotEmpty()
    id: number;

    @ApiProperty({ description: 'Pepe', example: 'VendorName' })
    @IsString()
    vendor: string;

    @ApiProperty({ description: 'Raw materials shipment', example: 'Item description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: '600', example: 100 })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ description: '300', example: 10 })
    @IsNumber()
    @IsNotEmpty()
    rate: number;

    @ApiProperty({ description: '2', example: 5 })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

}




