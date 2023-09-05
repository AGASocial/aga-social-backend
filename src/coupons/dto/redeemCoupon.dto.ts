import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export enum ResourceType {

    Ebook = 'Ebook',
    Course = 'Course',

}


export class RedeemCouponDto {



    @ApiProperty({
        description: 'Coupon code to redeem',
        example: 'SUMMER2023',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    couponCode: string;

    @ApiProperty({
        description: 'Type of resource to apply the coupon to (Course or Ebook)',
        example: 'Course',
        enum: ['Course', 'Ebook'],
    })
    @IsNotEmpty()
    @IsString()
    resourceType: ResourceType;


 
}
