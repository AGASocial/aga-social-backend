import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, IsArray, IsDate, IsEmail } from "class-validator";

export enum MessageType {
    Inquiry = 'Inquiry',
    Complaint = 'Complaint',
}

export class CreateMessageDto {
    @ApiProperty({
        description: 'Email of the sender',
        example: 'prueba111111@gmail.com',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail()
    public senderEmail: string;

    @ApiProperty({
        description: 'Email of the recipient',
        example: 'xdxd@gmail.com',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail()
    public recipientEmail: string;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Hello, I have a question regarding...',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public content: string;

    @ApiProperty({
        description: 'Attachment URLs',
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    public attachmentUrls: string[];

    @ApiProperty({
        description: 'Subject of the message',
        example: 'Regarding Your Recent Purchase',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public subject: string;

    @ApiProperty({
        description: 'Type of the message',
        example: MessageType.Inquiry,
        enum: MessageType,
    })
    @IsNotEmpty()
    public type: MessageType;

    @ApiProperty({
        description: 'Timestamp of when the message was sent',
        example: '2023-08-10T12:00:00Z',
        type: Date,
    })
    public sentDate?: Date;

    @ApiProperty({
        description: 'Timestamp of when the message was received',
        example: '2023-08-10T13:00:00Z',
        type: Date,
    })
    public receivedDate?: Date;

 
}
