import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsArray, IsString } from "class-validator";
import { DocResult } from "../../utils/docResult.entity";

export class GetMessagesByKeywordsDto {
    @ApiProperty({
        description: 'Email of the user',
        example: 'sender@example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail()
    public userEmail: string;

    

    @ApiProperty({
        description: 'Array of keywords to search for in message content',
        example: ['keyword1', 'keyword2'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    public keywords: string[];




}
