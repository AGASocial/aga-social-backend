import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../../auth/auth.module';
import { ChangeSecurityAnswerDto } from '../../../auth/dto/changeSecurityAnswer.dto';

describe('AuthService (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/firebase/users/security-answer (PUT)', async () => {
        const jwtToken = 'your-valid-jwt-token';

        const changeSecurityAnswerDto: ChangeSecurityAnswerDto = {
            password: "Vitra/?13",
            new_security_answer: "Perfect Green",
            email: "new_email@example.com"
        };

        const response = await request(app.getHttpServer())
            .put('/auth/firebase/users/security-answer')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(changeSecurityAnswerDto);
























        expect(response.status).toBe(500);
        
    });
});
