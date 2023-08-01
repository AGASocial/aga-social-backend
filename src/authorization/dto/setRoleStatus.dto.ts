import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Status } from "../entities/status.enum";


export class SetRoleStatusDto {
    @ApiProperty({
        description: "Role that will change it's status",
        type: String
    })
    @IsUUID()
    @IsOptional()
    role?: string;

    @ApiProperty({
        description: "New status for the role"
    })
    @IsNotEmpty()
    @IsEnum(Status, {
        message: "INVALIDSTATUS"
    })
    status: string;
}