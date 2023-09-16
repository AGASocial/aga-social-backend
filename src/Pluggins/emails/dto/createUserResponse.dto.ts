import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class CreateUserResponseDto {

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
        description: 'Descriptive response message, should return "USERREGISTEREDSUCCESSFULLY"',
        default: 'USERREGISTEREDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;



    @ApiProperty({
        description: 'ID of the user',
        type: String
    })
    public userId?: string;



    constructor(statusCode: number, message: string, userId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.userId = userId;
    }
}
