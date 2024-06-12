import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString } from "class-validator";


export class UpdateRoleResponseDto {
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

    constructor(status: string, code: number, message: string, result: Record<string, any>) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = {
            result: result
        };
    }

}