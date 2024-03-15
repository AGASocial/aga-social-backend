import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CouponStatus } from '../entities/coupon.entity';

enum DiscountType {
    Nominal = 'nominal',
    Percentual = 'percentual',
}

export class UpdateCouponDto {
    @ApiProperty({
        description: 'Coupon code',
        example: 'SUMMER2023',
        type: String,
    })
    @IsOptional()
    public code?: string;

    @ApiProperty({
        description: 'Coupon description',
        example: 'Summer Discount',
        type: String,
    })
    @IsOptional()
    public description?: string;

    @ApiProperty({
        description: 'Type of discount',
        enum: DiscountType,
    })
    @IsOptional()
    @IsEnum(DiscountType)
    public discountType?: DiscountType;

    @ApiProperty({
        description: 'Discount amount',
        example: 15,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    public discountAmount?: number;

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
    @IsOptional()
    @IsNumber()
    @Min(1)
    public maxUses?: number;

    @ApiProperty({
        description: 'Maximum number of uses per user for the coupon',
        example: 1,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    public maxUsesPerUser?: number;

    @ApiProperty({
        description: 'Coupon status',
        enum: CouponStatus,
    })
    @IsOptional()
    @IsEnum(CouponStatus)
    public status: CouponStatus;




    @ApiProperty({
        description: 'Max current number of uses for the coupon from all users',
        example: 1,
        type: Number,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    public currentUses?: number = 0;


    @ApiProperty({
        description: 'Id of the asset eligible for the coupon discount',
        example: '515dfds2fergf6b4fg8b4c6s4',
        type: String,
    })
    @IsOptional()
    public assetId?: string;

  

}
