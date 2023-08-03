import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteUserDto {
    @ApiProperty({
        description: 'Email of the user to be deleted',
        example: 'user@example.com',
    })
    @IsNotEmpty()
    @IsString()
    public email: string;

    @ApiProperty({
        description: 'Security answer provided by the user for verification',
        example: 'MySecurityAnswer123',
    })
    @IsNotEmpty()
    @IsString()
    public security_answer: string;
}
