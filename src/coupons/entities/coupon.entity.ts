import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum DiscountType {
    Nominal = 'nominal',
    Percentual = 'percentual',
}

export enum CouponStatus {
    Used = 'used',
    Expired = 'expired',
    Available = 'available',
    Eliminated = 'eliminated'
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
   public  discountType: DiscountType;

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
    public maxUses: number;

    @ApiProperty({
        description: 'Maximum number of uses per user for the coupon',
        example: 1,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
   public maxUsesPerUser: number;

    @ApiProperty({
        description: 'Coupon status',
        enum: CouponStatus,
    })
    @IsNotEmpty()
    @IsEnum(CouponStatus)
    public status: CouponStatus;


    @ApiProperty({
        description: 'Current number of uses the user has for the coupon',
        example: 1,
        type: Number,
        default: 0,
    })
    @IsNotEmpty()
    @IsNumber()
    public currentUsesPerUser: number = 0;


    @ApiProperty({
        description: 'Max current number of uses for the coupon from all users',
        example: 1,
        type: Number,
        default: 0,
    })
    @IsNotEmpty()
    @IsNumber()
    public totalMaxUses: number = 0;

}
