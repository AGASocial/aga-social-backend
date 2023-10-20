import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum DiscountType {
    Nominal = 'nominal',
    Percentual = 'percentual',
}

export enum CouponStatus {
    Expired = 'expired', 
    Available = 'available', 
    Eliminated = 'eliminated', 
    Draft = 'draft', 
    OutOfStock = 'outOfStock', 
}


export class Coupon {
    @ApiProperty({
        description: 'Coupon code',
        example: 'SUMMER2023',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public code: string;

    @ApiProperty({
        description: 'Coupon description',
        example: 'Summer Discount',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public description: string;

    @ApiProperty({
        description: 'Type of discount',
        enum: DiscountType,
    })
    @IsNotEmpty()
    @IsEnum(DiscountType)
    public discountType: DiscountType;

    @ApiProperty({
        description: 'Discount amount',
        example: 15,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    public discountAmount: number;

    @ApiProperty({
        description: 'Expiry date of the coupon',
        example: '2023-08-31',
        type: Date,
        required: false,
    })
    @IsOptional()
    public expiryDate?: Date | null;

    @ApiProperty({
        description: 'Maximum number of uses for the coupon',
        example: 100,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    public maxUses?: number;

    @ApiProperty({
        description: 'Maximum number of uses per user for the coupon',
        example: 1,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    public maxUsesPerUser: number;

    @ApiProperty({
        description: 'Coupon status',
        enum: CouponStatus,
    })
    @IsNotEmpty()
    @IsEnum(CouponStatus)
    public status: CouponStatus;




    @ApiProperty({
        description: 'Max current number of uses for the coupon from all users',
        example: 1,
        type: Number,
        default: 0,
    })
    @IsNumber()
    public currentUses?: number = 0;


    @ApiProperty({
        description: 'Id of the asset eligible for the coupon discount',
        example: '515dfds2fergf6b4fg8b4c6s4',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    public assetId: string;

    @ApiProperty({
        description: 'Array of user IDs who redeemed the coupon',
        example: ['543545dfe8r5w5wd', 's5s8fg5a5JTF4D5'],
        type: [String],
    })
    @IsOptional()
    @IsString({ each: true })
    public redeemedByUsers?: string[];


    @ApiProperty({
        description: 'Id of the creator of the coupon',
        example: '515dfds2fergf6b4fg8b4c6s4',
        type: String,
    })
    public createdBy?: string;

}
