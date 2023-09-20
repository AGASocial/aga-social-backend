import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SendMessageToAllDto {

    @ApiProperty({
        description: 'Email of the sender',
        example: 'sender@gmail.com',
        type: String
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    senderEmail: string;


    @ApiProperty({
        description: 'Password of the sender',
        example: 'password123',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    senderPassword: string;


    @ApiProperty({
        description: 'Subject of the message',
        example: 'Regarding your suggestion',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Hello, this is a test message.',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    content: string;




}
