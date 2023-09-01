import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDecimal, IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class CreatePlugginDto {
    @ApiProperty({ description: 'name' })
    @IsString()
    @MinLength(4)
    name: string;

    @ApiProperty({ description: 'description' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'monthly_price' })
    @IsNumber()
    monthly_price: number;

    @ApiProperty({ description: 'yearly_price' })
    @IsNumber()
    yearly_price: number;

    @ApiProperty({ description: 'active' })
    @IsBoolean()
    active: boolean;
}

export class Install {
    @ApiProperty({ description: 'url' })
    @IsString()
    @MinLength(4)
    url: string;
    @ApiProperty({ description: 'token' })
    @IsString()
    @MinLength(4)
    token: string;
}