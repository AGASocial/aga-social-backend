import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class GetUsersByPluginIdResponseDto {
    @ApiProperty({
        description: 'HTTP response status code',
        default: 200,
        type: Number,
    })
    @IsNotEmpty()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "USERSRETRIEVEDSUCCESSFULLY"',
        default: 'USERSRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    public message: string;

    @ApiProperty({
        description: 'Array of user data',
        type: [Object],
    })
    @IsArray()
    public users: Record<string, any>[];

    constructor(statusCode: number, message: string, users: Record<string, any>[]) {
        this.statusCode = statusCode;
        this.message = message;
        this.users = users;
    }
}
