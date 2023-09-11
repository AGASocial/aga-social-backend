import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { RedeemCouponDto, ResourceType } from '../../../coupons/dto/redeemCoupon.dto';
import { RedeemCouponResponseDto } from '../../../coupons/dto/redeemCouponResponse.dto';

describe('CouponService', () => {
    let couponService: CouponService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CouponService],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('redeemCoupon', () => {
        it('should redeem a coupon', async () => {
            const redeemCouponDto: RedeemCouponDto = {
                couponCode: 'Summer2023Yeah',
                resourceType: ResourceType.Ebook, 
            };

            const userId = 'SFUcEOGs1lbWj4PdVrRxjbyLOtU2';

            const response: RedeemCouponResponseDto = await couponService.redeemCoupon(redeemCouponDto, userId);

            expect(response.statusCode).toBe(201);
            expect(response.message).toBe('COUPONREDEEMEDSUCCESSFULLY');
            expect(response.discountedPrice).toBeDefined();
            expect(response.initialPrice).toBeDefined();
        });

    });
});
