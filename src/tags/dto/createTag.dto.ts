import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTagDto {
    @ApiProperty({
        description: 'Name of the tag',
        example: 'urgent',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public name: string;

    @ApiProperty({
        description: 'Username associated with the tag. Must be the username of a registered user',
        example: 'prueba11111',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public username: string;



}
