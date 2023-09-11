import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { GetCouponsResponseDto } from '../../../coupons/dto/getCouponsResponse.dto';
import { CouponStatus } from '../../../coupons/entities/coupon.entity';

describe('CouponService', () => {
    let couponService: CouponService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouponService],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('filterCouponsByStatus', () => {
        it('should filter coupons by status for a user', async () => {
            const filterStatus: CouponStatus = CouponStatus.Available;
            const userId = '44hZi5p78Rac0x8Mfr5PbCPN4B63';

            const response: GetCouponsResponseDto = await couponService.filterCouponsByStatus(filterStatus, userId);

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('COUPONSGOT');
        });
    });
});
