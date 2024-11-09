import { ApiProperty } from '@nestjs/swagger';

export class GlobalRole {
    @ApiProperty({ description: 'Role Id', example: '8AQmog8VTjnt' })
    id: string;

    @ApiProperty({ description: 'Role name', example: "Senior staff" })
    name: string;

    @ApiProperty({ description: 'Role description' })
    description1: string;

    @ApiProperty({ description: 'Role description' })
    description2: string;

    @ApiProperty({ description: 'Permissions granted to this role', type: [Number] })
    permissions: number[];
  }
