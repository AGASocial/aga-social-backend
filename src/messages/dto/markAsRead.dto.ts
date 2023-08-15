import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, IsArray, IsDate, IsEmail } from "class-validator";


export class MarkAsReadDto {
    @ApiProperty({
        description: 'Email of the sender',
        example: 'sender@example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail()
    public senderEmail: string;

    @ApiProperty({
        description: 'Email of the recipient',
        example: 'recipient@example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail()
    public recipientEmail: string;


    @ApiProperty({
        description: 'Subject of the message',
        example: 'Regarding Your Recent Purchase',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public subject: string;


    @ApiProperty({
        description: 'Indicates whether the message has been read',
        example: true,
        type: Boolean,
        default: false,
    })
    @IsNotEmpty()
    @IsBoolean()
    public isRead: boolean = false;



}