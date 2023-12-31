import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class CreateMessageResponseDto {

    @ApiProperty({
        description: 'HTTP response status code',
        default: 201,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "MESSAGECREATEDSUCCESSFULLY"',
        default: 'MESSAGECREATEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        description: 'ID of the created role',
        type: String
    })
    public messageId?: string;

    @ApiProperty({
        description: 'Picture of the user who sent the email',
        type: String
    })
    public senderPicture?: string;



    constructor(statusCode: number, message: string, messageId: string, senderPicture: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.messageId = messageId;
        this.senderPicture = senderPicture;
    }
}
