import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDecimal, IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class FindPluginPayDTO {
    @ApiProperty({ description: 'uid' })
    @IsString()
    @MinLength(4)
    uid: string;
}
