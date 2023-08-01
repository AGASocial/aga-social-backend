import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";


export class GetRoleByIdDto {
    @ApiProperty({
        description: "Id of the role, used for getting the role information"
    })
    @IsUUID()
    @IsNotEmpty()
    public role: string
}