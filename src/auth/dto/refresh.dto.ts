import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsOptional, IsString } from "class-validator";


export class RefreshDto {
    @ApiProperty({
        description: 'Jwt bearer token, used later to retrieve email and id for the process of refreshing the session'
    })
    @IsOptional()
    @IsString()
    @IsJWT()
    public refresh_token: string
}