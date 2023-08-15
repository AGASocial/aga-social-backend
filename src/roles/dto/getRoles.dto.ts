import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";


export class GetRolesDto {
    @ApiProperty({
        description: "Limit of roles retrieved",
        type: Number
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    public limit?: number

}