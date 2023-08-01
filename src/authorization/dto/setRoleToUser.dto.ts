import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsNotEmpty, IsString, IsUUID } from "class-validator";


export class SetRoleToUserDto {
    @ApiProperty({
        description: "User who's role will be set",
        type: String
    })
    @IsNotEmpty()
    @IsUUID()
    public user: string;

    @ApiProperty({
        description: "Role to be set for the user",
        type: String
    })
    @IsNotEmpty()
    @IsUUID()
    public role: string;
}