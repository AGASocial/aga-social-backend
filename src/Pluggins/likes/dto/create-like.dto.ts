import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
export class CreateLikeDto {
    @ApiProperty({ description: 'id_user' })
    @IsString()
    @MinLength(4)
    id_user: string;
    @ApiProperty({ description: 'url_domain' })
    @IsString()
    @MinLength(4)
    url_domain: string;
    @ApiProperty({ description: 'elemnt_id' })
    @IsString()
    @MinLength(4)
    element_id: string;


}

