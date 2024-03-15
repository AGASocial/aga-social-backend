import { IsAlpha, IsJWT, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUppercase } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class LogInResponseDto {
    @ApiProperty({
        example: 'success',
        description: 'Response status.'
    })
    status: string;

    @ApiProperty({
        example: 200,
        description: 'Response code.'
    })
    code: number;

    @ApiProperty({
        example: 'Request successfully processed.',
        description: 'Response message.'
    })
    message: string;

    @ApiProperty({
        type: 'object',
        description: 'Response data, contains the result.'
    })
    data: {
        result: Record<string, any>;
    };

    userId?: string;

    bearer_token?: string;

    authCookieAge?: number;

    refresh_token?: string;

    refreshCookieAge?: number;

    constructor(status: string, code: number, message: string, result: Record<string, any>) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = {
            result: result
        };
    }


}