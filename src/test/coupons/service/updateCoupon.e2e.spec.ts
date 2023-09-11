import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { UpdateCouponDto } from '../../../coupons/dto/updateCoupon.dto';
import { UpdateCouponResponseDto } from '../../../coupons/dto/updateCouponResponse.dto';
import { CouponStatus } from '../../../coupons/entities/coupon.entity';

describe('CouponService', () => {
    let couponService: CouponService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouponService],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('updateCoupon', () => {
        it('should update a coupon', async () => {
            const existingCouponCode = 'SUMMER2023Yeah';
            const updatedData: UpdateCouponDto = {
                code: existingCouponCode,
                description: 'Updated Summer Discount',
                status: CouponStatus.Draft
            };

            const response: UpdateCouponResponseDto = await couponService.updateCoupon(existingCouponCode, updatedData);

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('COUPONUPDATEDSUCCESSFULLY');

        });

    });
});
