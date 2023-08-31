import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
export class CreateNoteDto {
    @ApiProperty({ description: 'url' })
    @IsString()
    @MinLength(4)
    url: string;
    @ApiProperty({ description: 'description' })
    @IsString()
    @MinLength(4)
    description: string;
    @ApiProperty({ description: 'client_uid' })
    @IsString()
    @MinLength(4)
    client_uid: string;
}

export class FindNoteDTO {
    @ApiProperty({ description: 'url' })
    @IsString()
    @MinLength(4)
    url: string;
    @ApiProperty({ description: 'client_uid' })
    @IsString()
    @MinLength(4)
    client_uid: string;
}
