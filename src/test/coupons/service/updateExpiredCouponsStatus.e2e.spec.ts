import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { SetCouponAsExpiredResponseDto } from '../../../coupons/dto/setCouponAsExpiredResponse.dto';

describe('CouponService', () => {
    let couponService: CouponService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouponService],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('updateExpiredCouponsStatus', () => {
        it('should update expired coupons status', async () => {
            const response: SetCouponAsExpiredResponseDto = await couponService.updateExpiredCouponsStatus();

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('COUPONSUPDATEDSUCCESSFULLY');
        });
    });
});
