import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString, IsJWT, IsPositive, IsUppercase } from "class-validator";


export class RefreshResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        default: 200,
        type: Number
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "LOGINSUCCESSFUL"',
        default: "LOGINSUCCESSFUL",
        type: String
    })
    @IsString()
    @IsUppercase()
    @IsNotEmpty()
    public message: string;

    @ApiProperty({
        description: 'New Bearer token created by result of refreshing the session, used for login validation. The payload is user email and user id',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @IsJWT()
    public bearer_token: string;
}