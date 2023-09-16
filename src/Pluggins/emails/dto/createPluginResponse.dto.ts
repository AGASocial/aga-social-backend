import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class CreatePluginResponseDto {

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
        description: 'Descriptive response message, should return "PLUGINCREATEDSUCCESSFULLY"',
        default: 'PLUGINCREATEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'ID of the newly created plugin',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    public newPluginId: string;



    @ApiProperty({
        description: 'ID of the owner of the plugin',
        type: String
    })
    public ownerId?: string;


    constructor(statusCode: number, message: string, newPluginId: string, ownerId: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.newPluginId = newPluginId;
        this.ownerId = ownerId;

    }
}
