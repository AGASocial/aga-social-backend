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

    describe('getCouponsCreatedByUser', () => {
        it('should retrieve coupons created by a user', async () => {
            const userId = '44hZi5p78Rac0x8Mfr5PbCPN4B63'; 
            const response: GetCouponsResponseDto = await couponService.getCouponsCreatedByUser(userId);

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('COUPONSGOT');
        });
    });
});
