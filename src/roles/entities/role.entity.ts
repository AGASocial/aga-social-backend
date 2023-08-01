import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";
import { Policy } from "./policy.entity";
import { Stage } from "./stage.enum";
import { Rule } from "./rule.entity";


export class Role {

    @IsNotEmpty()
    @IsString()
    public role_name: string;

    @IsNotEmpty()
    @IsArray()
    public policies: Policy[];

    @IsNotEmpty()
    @IsArray()
    public rules: Rule[];
    
    @IsNotEmpty()
    @IsArray()
    public stages: string[];

    @IsNotEmpty()
    @IsNumberString()
    public session_time: string;

    @IsNotEmpty()
    @IsNumberString()
    public refresh_time: string;

    @IsNotEmpty()
    @IsString()
    public status: string;
    
}