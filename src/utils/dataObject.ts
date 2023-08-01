import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";


export class DataObject {
    @ApiProperty({
        description: "Input data allowed in the request body"
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    public body: string[]
    
    @ApiProperty({
        description: "Input data allowed in the request parameters"
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    public parameters: string[]

    @ApiProperty({
        description: "Input data allowed in the request queries"
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    public queries: string[]
}