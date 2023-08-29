import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class Tags {
    @ApiProperty({
        description: 'Name of the tag',
        example: 'urgent',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public name?: string;

    @ApiProperty({
        description: 'Username associated with the tag. Must be the username of a registered user',
        example: 'user123',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public username?: string;


    @ApiProperty({
        description: 'Firestore ID of the tag',
        example: 'tag-abcdef123456',
        type: String,
    })
    id?: string;


    @ApiProperty({
        description: 'Status of the tag, can be active or not',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;
}
