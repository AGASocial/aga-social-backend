import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase } from "class-validator";
import { NewPlugin } from "../entities/newPlugin.entity";




export class GetPluginInfoResponseDto {

    @ApiProperty({
        description: 'HTTP response status code',
        default: 201,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public statusCode: number;

    @ApiProperty({
        description: 'Descriptive response message, should return "PLUGINRETRIEVEDSUCCESSFULLY"',
        default: 'PLUGINRETRIEVEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;


    @ApiProperty({
        type: String,
        description: 'Information associated to the plugin retrieved'
    })
    public pluginInfo: NewPlugin;



    constructor(statusCode: number, message: string, pluginInfo: NewPlugin) {
        this.statusCode = statusCode;
        this.message = message;
        this.pluginInfo = pluginInfo;
    }



}
