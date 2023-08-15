import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";


export class GetUserByIdDto {
    @ApiProperty({
        description: "Id of the user, used for getting the user information"
    })
    @IsUUID()
    @IsNotEmpty()
    public user: string
}