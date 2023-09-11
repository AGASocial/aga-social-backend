import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { UpdateCouponDto } from '../../../coupons/dto/updateCoupon.dto';
import { CouponStatus } from '../../../coupons/entities/coupon.entity';
import { UpdateCouponResponseDto } from '../../../coupons/dto/updateCouponResponse.dto';

describe('CouponController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], 
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should update a coupon', () => {
        const couponCode = 'SUMMER2023Yeah'; 
        const updateCouponDto: UpdateCouponDto = {
            description: 'Updated Summer Discount',
            discountAmount: 20,
            status: CouponStatus.Draft, 
        };

        return request(app.getHttpServer())
            .put(`/coupons?code=${couponCode}`)
            .send(updateCouponDto)
            .expect(200) 
            .expect((response) => {
                const updateCouponResponseDto: UpdateCouponResponseDto = response.body;
                expect(updateCouponResponseDto.statusCode).toBe(200);
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
