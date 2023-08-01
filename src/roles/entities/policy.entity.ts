import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsEnum, IsLowercase, IsNotEmpty, IsOptional } from "class-validator";
import { Allowance } from "../../authorization/entities/allowance.enum";
import { Action } from "../../authorization/entities/action.enum";
import { Subject } from "@casl/ability";


export class Policy {

    @ApiProperty({
        description: "states whether the user is allowed or not to perform certain actions. Must be of Enum Allowance (CAN or CANNOT)"
    })
    @IsNotEmpty()
    @IsEnum(Allowance)
    public allowance: Allowance;

    @ApiProperty({
        description: "states the action in question, CRUD is suggested"
    })
    @IsNotEmpty()
    @IsEnum(Action)
    public action: Action;

    @ApiProperty({
        description: "states the subject of the action, domain entities are suggested"
    })
    @IsNotEmpty()
    public subject: Subject;

    @ApiProperty({
        description: "states the fields of the subject"
    })
    @IsOptional()
    @IsLowercase({each: true})
    @IsAlpha('es-ES',{each: true})
    public fields?: string[];

}