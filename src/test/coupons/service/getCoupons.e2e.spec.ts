import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../../../coupons/coupon.service';
import { GetCouponsResponseDto } from '../../../coupons/dto/getCouponsResponse.dto';
import { FirebaseService } from '../../../firebase/firebase.service';
import { DocResult } from '../../../utils/docResult.entity';

describe('CouponService', () => {
    let couponService: CouponService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponService,
                {
                    provide: FirebaseService,
                    useValue: {
                        getCollectionData: jest.fn(),
                    },
                },
            ],
        }).compile();

        couponService = module.get<CouponService>(CouponService);
    });

    describe('getCoupons', () => {
        it('should retrieve all coupons', async () => {
            jest.spyOn(couponService['firebaseService'], 'getCollectionData').mockResolvedValue([]);

            const response: GetCouponsResponseDto = await couponService.getCoupons();

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('COUPONSRETRIEVEDSUCCESSFULLY');
        });

        it('should retrieve cached coupons if available', async () => {
            const cachedCoupons: DocResult[] = [];
            jest.spyOn(couponService['firebaseService'], 'getCollectionData').mockResolvedValue(cachedCoupons);

            const response: GetCouponsResponseDto = await couponService.getCoupons();

            expect(response.statusCode).toBe(200);
            expect(response.message).toBe('COUPONSRETRIEVEDSUCCESSFULLY');
            expect(response.couponsFound).toEqual(cachedCoupons);
        });

    });
});
