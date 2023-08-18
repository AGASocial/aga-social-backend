import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString, MinLength } from "class-validator";
export class CartItem {
    @ApiProperty({ description: 'name' })
    @IsString()
    name: string;
    @ApiProperty({ description: 'price' })
    @IsNumber()
    price: number;
    @ApiProperty({ description: 'uantity' })
    @IsNumber()
    uantity: number;
    @ApiProperty({ description: 'desciption' })
    @IsString()
    desciption?: string;
    _id: string;
    __v: number;
}
export type Cart = CartItem[]