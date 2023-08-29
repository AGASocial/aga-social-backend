import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateTagDto {


    @ApiProperty({
        description: 'Name of the tag',
        example: 'urgent',
        type: String,
    })
    public name?: string;

    @ApiProperty({
        description: 'Status of the tag, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;



}
