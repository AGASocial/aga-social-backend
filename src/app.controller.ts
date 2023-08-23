import { Controller, Get, Post, UseGuards, Req, UseInterceptors, Body, Param, Query, Res } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/strategies/jwt-auth.guard';
import { Roles } from './authorization/roles.decorator';
import { AbilityFactory } from './ability/factory/ability.factory';
import { Request, Response } from 'express';
import { CheckPolicies, CreateRole, ManageUser, ReadUser, UpdateUser } from './authorization/policies.decorator';
import { PoliciesGuard } from './authorization/policies.guard';
import { StageGuard } from './authorization/stage.guard';
import { AuthorizationService } from './authorization/authorization.service';
import { GetUserByIdDto } from './users/dto/getUserById.dto';
import { GetUserByIdResponseDto } from './users/dto/getUserByIdResponse.dto';
import { DataFiltererService } from './utils/dataFilterer.service';
import { PrivacyGuard } from './authorization/privacy.guard';
import { ExceptedRoles } from './authorization/exceptedRoles.decorator';
import { doubleCsrfProtection, generateToken, stage, validateRequest } from './utils/constants';

@Controller()
export class AppController {
    constructor(private authService: AuthService, private abilityFactory: AbilityFactory, private authorizationService: AuthorizationService, private dataFiltererService: DataFiltererService) { }


/*
   @UseGuards(JwtAuthGuard)
    @Get('mock/subscriber')
    @Roles("subscriber")
    mockClient(@Req() req) {
        return 'You have entered the route only for subscribers'
    }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
    @Get('mock/publisher')
    @Roles("publisher")
    @CheckPolicies(new ReadUser(["email", "username"]))
    mockManager(@Req() req) {
        return 'You have entered the route only for publishers'
    }


   @UseGuards( JwtAuthGuard, PoliciesGuard, StageGuard)
    @Roles("admin")
   @CheckPolicies(new ManageUser())
    @Get('mock/admin')
    async mockAdmin(@Req() req: Request) {


        return 'You have entered the route only for admins'
    }

    @Post('control/:id')
    async control(@Param('id') id: string, @Query('limit') limit: string, @Req() req: Request, @Res() res: Response) {


        let testObject = {
            name: 'Victor',
            age: '24',
            passport: {
                id: '1',
                country: 'france',
                dates: {
                    expedition: '01/01/2022',
                    expiration: '31/12/2030'
                }
            },
            house: {
                id: '2020',
                address: {
                    continent: 'europe',
                    country: 'france',
                    city: 'paris'
                }
            },
            books: [
                {
                    tittle: "Book1",
                    author: "Author1"
                },
                {
                    tittle: "Book2",
                    author: "Author2"
                }
            ],
            cars: ["mazda", "toyota", "ferrari", "porsche"]
        }

        let mockDataInRule: string[] = ['books', 'books.tittle', 'name', 'age', 'passport', 'house', 'passport.country', 'passport.dates', 'passport.dates.expiration', 'house.address', 'house.address.city', 'cars'];

        this.dataFiltererService.filter(testObject, mockDataInRule);

        res.send(testObject);
    }




    @UseGuards(JwtAuthGuard, PrivacyGuard)
    @ExceptedRoles("admin")
    @Get('users/:userId')
    async getUserById(@Param('userId') userId: string, @Req() req: Request): Promise<GetUserByIdResponseDto> {



        let getUserByIdDto: GetUserByIdDto = { user: userId };
        let userSnap = await this.authorizationService.getUserById(getUserByIdDto);
        let userData = userSnap.data();

        const getUserByIdResponseDto: GetUserByIdResponseDto = {
            statusCode: 200,
            message: "USERGOTEN",
            country: userData.country,
            email: userData.email,
            groups: userData.groups,
            name: userData.name,
            password: userData.password,
            roles: userData.roles,
            security_answer: userData.security_answer,
            username: userData.username
        }

        return getUserByIdResponseDto;
    }
    */
}

