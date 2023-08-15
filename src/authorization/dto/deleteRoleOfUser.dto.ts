import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Role } from "../entities/role.enum";


export class DeleteRoleOfUserDto {
    @ApiProperty({
        description: "User who's role will be deleted",
        type: String
    })
    @IsNotEmpty()
    @IsUUID()
    public user: string;

    @ApiProperty({
        description: "Role that will be removed from the user",
        type: String
    })
    @IsNotEmpty()
    @IsUUID()
    public role: string;
}