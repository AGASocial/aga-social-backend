import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";


export class GetRolesDto {
    @ApiProperty({
        description: "Limit of roles retrieved",
        type: Number
    })
    @IsNumber()
    @IsPositive()
    public limit: number

}