import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsObject, IsString, IsUrl, Matches, MaxLength, ValidateNested } from "class-validator";
import { HttpMethod } from "./httpMethod.enum";
import { DataObject } from "src/utils/dataObject";
import { Type as ValidateType } from "class-transformer";


export class Rule {

    @ApiProperty({
        description: 'Http method that will be affected by the rule',
        type: String
    })
    @IsNotEmpty()
    @IsEnum(HttpMethod)
    public method: string;

    @ApiProperty({
        description: 'Url that will be affected by the rule',
        type: String
    })
    @IsNotEmpty()
    @Matches('\/[a-zA-Z0-9_\/-]*$','',{message: 'INVALIDROUTE'})
    public route: string;

    @ApiProperty({
        description: 'Input data that will be allowed by the rule, represent dto attributes'
    })
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @ValidateType(() => DataObject)
    public data_in: DataObject;

    @ApiProperty({
        description: 'Output data that will be allowed by the rule, represent dto attributes'
    })
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @ValidateType(() => DataObject)
    public data_out: DataObject;

    constructor(method: string, route: string, data_in: DataObject, data_out: DataObject){
        this.method = method;
        this.route = route;
        this.data_in = data_in;
        this.data_out = data_out;
    }
}