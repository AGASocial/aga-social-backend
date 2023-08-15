import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';


export enum ResourceType {

    Ebook = 'Ebook',
    Course = 'Course',

}


export class RedeemCouponDto {
    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    useremail: string;

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

    @ApiProperty({
        description: 'Title of resource to apply the coupon to (Course or Ebook)',
        example: "Last Summer",
    })
    @IsNotEmpty()
    resourceTitle: string;
}
