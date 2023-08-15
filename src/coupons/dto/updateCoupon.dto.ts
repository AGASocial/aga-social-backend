import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
    @IsNotEmpty()
    @IsString()
    code?: string;

    @ApiProperty({
        description: 'Coupon description',
        example: 'Summer Discount',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Type of discount',
        enum: DiscountType,
    })
    @IsNotEmpty()
    @IsEnum(DiscountType)
    discountType?: DiscountType;

    @ApiProperty({
        description: 'Discount amount',
        example: 15,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    discountAmount?: number;

    @ApiProperty({
        description: 'Expiry date of the coupon',
        example: '2023-08-31',
        type: Date,
        required: false,
    })
    @IsOptional()
    expiryDate?: Date | null;

    @ApiProperty({
        description: 'Maximum number of uses for the coupon',
        example: 100,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxUses?: number;

    @ApiProperty({
        description: 'Maximum number of uses per user for the coupon',
        example: 1,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxUsesPerUser?: number;
}
