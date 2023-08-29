import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";


export class GetMessagesFilteredDto {


    @ApiProperty({
        description: 'Filter of the message',
        example: 'read',
    })
    public filter: string;


    @ApiProperty({
        description: 'Email of the recipient',
        example: 'recipient@example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail()
    public email: string;


}