import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CouponStatus } from '../entities/coupon.entity';

export enum DiscountType {
    Nominal = 'nominal',
    Percentual = 'percentual',
}


export class CreateCouponDto {
    @ApiProperty({
        description: 'Id of the creator of the coupon',
        example: '515dfds2fergf6b4fg8b4c6s4',
        type: String,
    })
    @IsOptional()
    public createdBy?: string;

    @ApiProperty({
        description: 'Coupon code',
        example: 'SUMMER2023',
        type: String,
    })
    @IsNotEmpty({ message: 'Coupon code is invalid' })
    @IsString({ message: 'Coupon code is invalid' })
    public code: string;

    @ApiProperty({
        description: 'Coupon description',
        example: 'Summer Discount',
        type: String,
    })
    @IsNotEmpty({ message: 'Coupon description is invalid' })
    @IsString({ message: 'Coupon description is invalid' })
    public description: string;

    @ApiProperty({
        description: 'Type of discount',
        enum: DiscountType,
    })
    @IsNotEmpty({ message: 'Discount type is invalid' })
    @IsEnum(DiscountType, { message: 'Discount type is invalid' })
    public discountType: DiscountType;

    @ApiProperty({
        description: 'Discount amount',
        example: 15,
        type: Number,
    })
    @IsNotEmpty({ message: 'Discount amount is invalid' })
    @IsNumber({}, { message: 'Discount amount is invalid' })
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
    @IsNotEmpty({ message: 'Max uses is invalid' })
    @IsNumber({}, { message: 'Max uses is invalid' })
    @Min(1, { message: 'Max uses must be greater than or equal to 1' })
    public maxUses?: number;

    @ApiProperty({
        description: 'Maximum number of uses per user for the coupon',
        example: 1,
        type: Number,
    })
    @IsNotEmpty({ message: 'Max uses per user is invalid' })
    @IsNumber({}, { message: 'Max uses per user is invalid' })
    public maxUsesPerUser: number;

    @ApiProperty({
        description: 'Coupon status',
        enum: CouponStatus,
    })
    @IsNotEmpty({ message: 'Coupon status is invalid' })
    @IsEnum(CouponStatus, { message: 'Coupon status is invalid' })
    public status?: CouponStatus;

    @ApiProperty({
        description: 'Max current number of uses for the coupon from all users',
        example: 1,
        type: Number,
        default: 0,
    })
    @IsNumber({}, { message: 'Current uses is invalid' })
    public currentUses?: number = 0;

    @ApiProperty({
        description: 'Id of the asset eligible for the coupon discount',
        example: '515dfds2fergf6b4fg8b4c6s4',
        type: String,
    })
    @IsNotEmpty({ message: 'Asset ID is invalid' })
    @IsString({ message: 'Asset ID is invalid' })
    public assetId: string;
}