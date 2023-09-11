import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { CreateCouponDto, DiscountType } from '../../../coupons/dto/createCoupon.dto';
import { CreateCouponResponseDto } from '../../../coupons/dto/createCouponResponse.dto';
import { CouponStatus } from '../../../coupons/entities/coupon.entity';



describe('CouponService', () => {
    let couponService: CouponService; 

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouponService],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('createNewCoupon', () => {
        it('should create a new coupon', async () => {
            const createCouponDto: CreateCouponDto = {
                code: 'AUTUMN2023',
                description: 'Autumn Discount',
                discountType: DiscountType.Percentual,
                discountAmount: 15,
                expiryDate: new Date(),
                maxUses: 100,
                maxUsesPerUser: 1,
                assetId: '65c8cf10-3726-4776-a35a-b0e5867dcf64',
                status: CouponStatus.Draft,
                createdBy: '1w54iIFPN0M7YNgo10XuLIVUkJk2',
            };

            const response: CreateCouponResponseDto = await couponService.createNewCoupon(createCouponDto);

            expect(response.statusCode).toBe(201);
            expect(response.message).toBe('COUPONCREATEDSUCCESSFULLY');
            expect(response.code).toBe(createCouponDto.code);

        });
    });
});
