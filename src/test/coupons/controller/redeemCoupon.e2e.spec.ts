import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { RedeemCouponDto, ResourceType } from '../../../coupons/dto/redeemCoupon.dto';
import { RedeemCouponResponseDto } from '../../../coupons/dto/redeemCouponResponse.dto';

describe('CouponController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should redeem a coupon for a resource', () => {
        const redeemCouponDto: RedeemCouponDto = {
            couponCode: 'Summer2023Yeah',
            resourceType: ResourceType.Ebook,
        };

        return request(app.getHttpServer())
            .post(`/coupons/assets?id=65c8cf10-3726-4776-a35a-b0e5867dcf64`)
            .send(redeemCouponDto)
            .expect(200)
            .expect((response) => {
                const redeemCouponResponseDto: RedeemCouponResponseDto = response.body;
                expect(redeemCouponResponseDto.discountedPrice).toBeDefined();
                expect(redeemCouponResponseDto.initialPrice).toBeDefined();
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
