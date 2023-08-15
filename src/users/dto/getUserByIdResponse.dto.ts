import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, IsUppercase } from "class-validator";
import { DocumentData } from "firebase/firestore";


export class GetUserByIdResponseDto {
    @ApiProperty({
        description: 'Http response status code',
        default: 200,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, it should return "USERGOTEN"',
        default: 200,
        type: String
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: "User country"
    })
    public country?: string;

    @ApiProperty({
        description: "User email"
    })
    public email?: string;

    @ApiProperty({
        description: "User groups"
    })
    public groups?: string[]

    @ApiProperty({
        description: "User's name"
    })
    public name?: string;

    @ApiProperty({
        description: "User's password"
    })
    public password: string;

    @ApiProperty({
        description: "User's roles"
    })
    public roles: string[]

    @ApiProperty({
        description: "User's security answer"
    })
    public security_answer: string;

    @ApiProperty({
        description: "Username"
    })
    public username: string
}