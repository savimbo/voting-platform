import { ApiProperty } from '@nestjs/swagger';

export class GlobalPermissionDetail {
    @ApiProperty({ description: 'Permission Id', example: 17 })
    id: number;
    
    @ApiProperty({ description: 'Permission unique string', example: 'user_profile.view' })
    text_id: string;

    @ApiProperty({ description: 'Permission category', example: 2 })
    category_id: number;  // for user interface, to show the permissions grouped

    @ApiProperty({ description: 'Description', example: 'Can view user profiles' })
    scope: string;
  }

  
  export class GlobalPermissionCategory {
    @ApiProperty({ description: 'Permission Category Id', example: 2 })
    id: number;

    @ApiProperty({ description: 'Description', example: "User" })
    description: string;
}


  