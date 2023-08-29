import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';


export class AssignCouponDto {

    @ApiProperty({
        description: 'Firestore ID of the user',
        example: 'abcdef123456',
        type: String
    })
    id?: string;


    @ApiProperty({
        description: 'Coupon code to redeem',
        example: 'SUMMER2023',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    couponCode: string;


}