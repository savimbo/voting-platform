import { ApiProperty } from "@nestjs/swagger";
import { ItemVoting } from "./item_voting.dto";

export class CreateVotingDto {
    @ApiProperty({ description: "Name of the voting", example: 'Repair bridge' })
    name_voting: string;

    @ApiProperty({ description: "Description of the voting", example: 'Repair the bridge railings that are damaged' })
    description_voting: string;

    @ApiProperty({ description: "Optional note",  nullable: true  })
    note_voting?: string;
    
    @ApiProperty({ 
        description: "List of items related to this voting", 
        type: () => [ItemVoting], 
        nullable: true 
    })
    items: ItemVoting[] = [];

}

