import { ArrayMinSize, IsAlpha, IsArray, IsEnum, IsLowercase, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, IsUppercase, ValidateNested, arrayMinSize } from "class-validator";
import { Policy } from "../../roles/entities/policy.entity";
import { Rule } from "src/roles/entities/rule.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Type as ValidateType } from "class-transformer";
import { Stage } from "src/roles/entities/stage.enum";


export class UpdateRoleDto {

    @IsOptional()
    @IsUUID()
    public role?: string;

    @IsOptional()
    @IsString()
    @IsLowercase()
    @IsAlpha()
    public role_name?: string;

    @ApiProperty({
        description: 'New role policies',
        type: [Policy]
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    @ValidateType(() => Policy)
    public policies?: Policy[];

    @ApiProperty({
        description: 'New role rules',
        type: [Rule]
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    @ValidateType(() => Rule)
    public rules?: Rule[];
    
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsAlpha("es-ES",{each: true})
    @IsUppercase({each: true})
    @IsEnum(Stage, {each: true})
    public stages?: string[];

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public session_time?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public refresh_time?: number;

}