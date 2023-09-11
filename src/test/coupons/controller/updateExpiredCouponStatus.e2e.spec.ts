import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { SetCouponAsExpiredResponseDto } from '../../../coupons/dto/setCouponAsExpiredResponse.dto';

describe('CouponController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should set coupons as expired', () => {
        return request(app.getHttpServer())
            .patch(`/coupons`)
            .expect(200)
            .expect((response) => {
                const setCouponAsExpiredResponseDto: SetCouponAsExpiredResponseDto = response.body;
                expect(setCouponAsExpiredResponseDto.statusCode).toBe(200);
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
