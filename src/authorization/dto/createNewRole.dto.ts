import { ArrayMinSize, IsAlpha, IsArray, IsEnum, IsLowercase, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, IsUppercase, ValidateNested } from "class-validator";
import { Policy } from "../../roles/entities/policy.entity";
import { Rule } from "src/roles/entities/rule.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Type as ValidateType } from 'class-transformer';
import { Stage } from "src/roles/entities/stage.enum";


export class CreateNewRoleDto {

    @ApiProperty({
        description: 'Name for the new role',
        example: 'admin',
        required: true,
        type: String
    })
    @IsNotEmpty()
    @IsLowercase()
    @IsAlpha()
    public role_name: string;

    @ApiProperty({
        description: 'Is an array of policy, each policy defines privileges for the user in that role',
        required: true,
        type: [Policy]
    })
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    @ValidateType(() => Policy)
    public policies: Policy[];

    @ApiProperty({
        description: 'Is an array of rule, each rule defines what the user may send as input and what the user may recibe as output',
        required: true,
        type: [Rule]
    })
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    @ValidateType(()=> Rule)
    public rules: Rule[];
    
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @IsAlpha("es-ES",{each: true})
    @IsUppercase({each: true})
    @IsEnum(Stage,{each: true})
    public stages: string[];

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public session_time: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public refresh_time: number;

}