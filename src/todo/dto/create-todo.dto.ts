import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsBoolean } from "class-validator";
export class CreateTodoDto {
    @ApiProperty({ description: 'url' })
    @IsString()
    @MinLength(4)
    url: string;
    @ApiProperty({ description: 'client_uid' })
    @IsString()
    @MinLength(4)
    client_uid: string;
    @ApiProperty({ description: 'description' })
    @IsString()
    @MinLength(4)
    description: string;
    @ApiProperty({ description: 'done' })
    @IsBoolean()
    done: boolean;
}
export class FindTodoDTO {
    @ApiProperty({ description: 'url' })
    @IsString()
    @MinLength(4)
    url: string;
    @ApiProperty({ description: 'client_uid' })
    @IsString()
    @MinLength(4)
    client_uid: string;
}

