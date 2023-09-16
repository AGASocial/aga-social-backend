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

}

