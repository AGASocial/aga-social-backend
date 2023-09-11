import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { GetCouponsResponseDto } from '../../../coupons/dto/getCouponsResponse.dto';

describe('CouponController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should retrieve all coupons', () => {
        return request(app.getHttpServer())
            .get(`/coupons`)
            .expect(200)
            .expect((response) => {
                const getCouponsResponseDto: GetCouponsResponseDto = response.body;
                expect(getCouponsResponseDto.statusCode).toBe(200);
                expect(getCouponsResponseDto.message).toBe('COUPONSRETRIEVEDSUCCESSFULLY');
            });
    });

    it('should retrieve coupons by code', () => {
        const couponCode = 'Summer2023Yeah'; 
        return request(app.getHttpServer())
            .get(`/coupons?code=${couponCode}`)
            .expect(200)
            .expect((response) => {
                const getCouponsResponseDto: GetCouponsResponseDto = response.body;
                expect(getCouponsResponseDto.statusCode).toBe(200);
                expect(getCouponsResponseDto.message).toBe('COUPONSRETRIEVEDSUCCESSFULLY');
            });
    });

    it('should retrieve coupons created by user', () => {
        const userId = '515dfds2fergf6b4fg8b4c6s4'; 
        return request(app.getHttpServer())
            .get(`/coupons?id=${userId}`)
            .expect(200)
            .expect((response) => {
                const getCouponsResponseDto: GetCouponsResponseDto = response.body;
                expect(getCouponsResponseDto.statusCode).toBe(200);
                expect(getCouponsResponseDto.message).toBe('COUPONSRETRIEVEDSUCCESSFULLY');
            });
    });



    afterAll(async () => {
        await app.close();
    });
});
