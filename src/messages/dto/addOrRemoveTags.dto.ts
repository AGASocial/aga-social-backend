import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray, IsString, IsOptional } from "class-validator";

export class AddOrRemoveTagsRequestDto {
   

    @ApiProperty({
        description: 'Array of tag IDs to add or remove',
        example: ['5AGdF617CVpLyGeZerwa'],
        type: [String],
    })
    @IsOptional()
    public tagsIds?: string[];

    @ApiProperty({
        description: 'Action to perform (add or delete)',
        example: 'add',
        enum: ['add', 'delete'],
    })
    @IsOptional()
    @IsString()
    public action?: 'add' | 'delete';
}
