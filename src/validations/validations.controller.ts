import { Controller, Get } from '@nestjs/common';
import { Validation } from '../auth/dto/signup.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class ValidationController {
    @Get('validations/signup')
    getValidation(): { username: Validation, email: Validation, password: Validation } {
        const filePath = path.join(__dirname, '../../validations.json'); 

        const validations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const usernameValidation: Validation = validations.username;
        const emailValidation: Validation = validations.email;
        const passwordValidation: Validation = validations.password;

        return { username: usernameValidation, email: emailValidation, password: passwordValidation };
    }
}
