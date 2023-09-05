import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsAlpha, IsUppercase, IsNumber, IsPositive } from "class-validator";

export class RedeemCouponResponseDto {

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
        description: 'Descriptive response message, should return "COUPONREDEEMEDSUCCESSFULLY"',
        default: 'COUPONREDEEMEDSUCCESSFULLY',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsAlpha()
    @IsUppercase()
    public message: string;

    @ApiProperty({
        description: 'Price of the resource after applying the coupon discount',
        example: 90.00,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public discountedPrice: number;



    @ApiProperty({
        description: 'Price of the resource before applying the coupon discount',
        example: 90.00,
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    public initialPrice: number;



    constructor(statusCode: number, message: string, discountedPrice: number, initialPrice: number) {
        this.statusCode = statusCode;
        this.message = message;
        this.discountedPrice = discountedPrice;
        this.initialPrice = initialPrice;

    }
}
