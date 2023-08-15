import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';


export class AssignCouponDto {

    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({
        description: 'Coupon code to redeem',
        example: 'SUMMER2023',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    couponCode: string;


}