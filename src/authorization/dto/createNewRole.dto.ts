import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsBoolean } from "class-validator";
import { Policy } from "../../roles/entities/policy.entity";
import { Rule } from "src/roles/entities/rule.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Type as ValidateType } from 'class-transformer';
import { Stage } from "src/roles/entities/stage.enum";


export class CreateNewRoleDto {

    @ApiProperty({
        description: 'Role name',
        example: 'Subscriber, Publisher or Admin',
    })
    @IsNotEmpty()
    @IsString()
    public name: string;

    @ApiProperty({
        description: 'Describes the role and its nature',
        example: 'Subscribers are user that can buy courses and e-books offered by Publishers',
    })
    @IsNotEmpty()
    @IsString()
    public description: string;

    @ApiProperty({
        description: 'Indicates if the role is the defaukt for new users. Subscriber is, Publisher and Admin are not',
        example: true,
    })
    @IsBoolean()
    public default?: boolean;

    @ApiProperty({
        description: 'Indicates if the role is enabled or disabled',
        example: true,
    })
    @IsBoolean()
    public active?: boolean;
 

}