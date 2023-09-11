import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('CouponController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule], 
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should create a coupon', () => {
        const createCouponDto = {
            code: 'Summer2023Yeah',
            description: 'Summer Discount',
            discountType: 'nominal', 
            discountAmount: 15,
            maxUsesPerUser: 1,
            assetId: '65c8cf10-3726-4776-a35a-b0e5867dcf64',
            createdBy: '1w54iIFPN0M7YNgo10XuLIVUkJk2',
        };

        return request(app.getHttpServer())
            .post('/coupons')
            .send(createCouponDto)
            .expect(201) 
            .expect((response) => {
                const createCouponResponseDto = response.body;
                expect(createCouponResponseDto.statusCode).toBe(201);
                expect(createCouponResponseDto.code).toBeDefined();
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
