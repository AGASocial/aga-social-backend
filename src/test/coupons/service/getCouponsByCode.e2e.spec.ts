import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { GetCouponsResponseDto } from '../../../coupons/dto/getCouponsResponse.dto';

describe('CouponService', () => {
    let couponService: CouponService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouponService],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('getCouponByCode', () => {
        it('should retrieve a coupon by code', async () => {
            const couponCode = 'SUMMER10'; 

            const response: GetCouponsResponseDto = await couponService.getCouponByCode(couponCode);

            expect(response.statusCode).toBe(200);
            expect(response.couponsFound.length).toBe(1);
        });

    });
});
