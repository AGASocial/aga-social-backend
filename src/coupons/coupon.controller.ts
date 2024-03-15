import { Body, Controller, Get,Param, Patch, Post, Put, Query, Res } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/createCoupon.dto";
import { CreateCouponResponseDto } from "./dto/createCouponResponse.dto";
import { GetCouponsResponseDto } from "./dto/getCouponsResponse.dto";
import { RedeemCouponDto } from "./dto/redeemCoupon.dto";
import { RedeemCouponResponseDto } from "./dto/redeemCouponResponse.dto";
import { SetCouponAsExpiredResponseDto } from "./dto/setCouponAsExpiredResponse.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";
import { UpdateCouponResponseDto } from "./dto/updateCouponResponse.dto";
import {  Response } from "express";




@Controller()
@ApiTags('Coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }


   
    @ApiTags('Coupons')
    @ApiOperation({ summary: 'Create a new coupon' })
    @ApiBody({ type: CreateCouponDto })
    @ApiResponse({ status: 201, type: CreateCouponResponseDto, description: 'Coupon created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request: Invalid input, coupon already exists, invalid status, invalid discount type, asset does not exist, or expiry date is invalid' })
    @Post('coupons')
    async createCoupon(@Body() createCouponDto: CreateCouponDto, @Res() res: Response) {
        try {
            const createCouponResponse: CreateCouponResponseDto = await this.couponService.createNewCoupon(createCouponDto);

            res.status(createCouponResponse.code).send({
                status: createCouponResponse.status,
                code: createCouponResponse.code,
                message: createCouponResponse.message,
                data: createCouponResponse.data.result,
            });
        } catch (error) {
            console.error('Error creating coupon:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to create coupon',
                data: {}
            });
        }
    }





    
    @ApiTags('Coupons')
    @ApiOperation({ summary: 'Update a coupon using its code' })
    @ApiParam({ name: 'code', description: 'Coupon code', type: 'string', example: 'TESTCOUPON123' })
    @ApiBody({ type: UpdateCouponDto })
    @ApiResponse({ status: 200, type: UpdateCouponResponseDto, description: 'Coupon updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request: Invalid input or coupon not found' })
    @Patch('coupons/:code')
    async updateCoupon(
        @Param('code') code: string,
        @Body() updateCouponDto: UpdateCouponDto,
        @Res() res: Response
    ) {
        try {
            const updateCouponResponse: UpdateCouponResponseDto = await this.couponService.updateCoupon(code, updateCouponDto);

            res.status(updateCouponResponse.code).send({
                status: updateCouponResponse.status,
                code: updateCouponResponse.code,
                message: updateCouponResponse.message,
                data: updateCouponResponse.data.result,
            });
        } catch (error) {
            console.error('Error updating coupon:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to update coupon',
                data: {},
            });
        }
    }








    @ApiTags('Coupons')
    @ApiOperation({ summary: 'Redeem a coupon' })
    @ApiParam({ name: 'userId', description: 'User ID', type: 'string', example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @ApiBody({ type: RedeemCouponDto })
    @ApiOkResponse({ description: 'Coupon redeemed successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupon not found' })
    @Patch('users/:userId/coupons/assets')
    async redeemCoupon(
        @Param('userId') userId: string,
        @Body() redeemCouponDto: RedeemCouponDto,
        @Res() res: Response
    ): Promise<RedeemCouponResponseDto> {
        try {
            const response: RedeemCouponResponseDto = await this.couponService.redeemCoupon(redeemCouponDto, userId);

            res.status(response.code).send({
                status: response.status,
                code: response.code,
                message: response.message,
                data: response.data.result,
            });

            return response;
        } catch (error) {
            console.error('Error redeeming coupon:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to redeem coupon',
                data: {},
            });

        }
    }





    
    @ApiTags('Coupons')
    @ApiOperation({ summary: 'Sets a coupon\'s status to expired' })
    @ApiOkResponse({ description: 'Coupon status updated successfully', type: SetCouponAsExpiredResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupon not found' })
    @Patch('coupons')
    async updateExpiredCouponsStatus(@Res() res: Response) {
        try {
            const updateStatusResponse: SetCouponAsExpiredResponseDto = await this.couponService.updateExpiredCouponsStatus();

            res.status(updateStatusResponse.code).send({
                status: updateStatusResponse.status,
                code: updateStatusResponse.code,
                message: updateStatusResponse.message,
                data: updateStatusResponse.data.result,
            });

        } catch (error) {
            console.error('Error updating coupon status:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Error updating coupon status',
                data: {},
            });
        }
    }





    @ApiTags('Coupons')
    @ApiOperation({ summary: 'Retrieve coupons by code' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupons not found' })
    @Get('coupons/:code')
    async getCouponByCode(
        @Param('code') code: string,
        @Res() res: Response
    ): Promise<GetCouponsResponseDto> {
        try {
            const couponResponse: GetCouponsResponseDto = await this.couponService.getCouponByCode(code);

            res.status(couponResponse.code).send({
                status: couponResponse.status,
                code: couponResponse.code,
                message: couponResponse.message,
                data: couponResponse.data.result,
            });

            return couponResponse;
        } catch (error) {
            console.error('Error retrieving coupons:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Failed to retrieve coupons',
                data: {},
            });

        }
    }

    @ApiTags('Coupons')
    @ApiParam({ name: 'userId', description: 'User ID', type: 'string', example: '0EwINikFVAg7jtRdkZYiTBXN4vW2' })
    @ApiOperation({ summary: 'Retrieve coupons by user ID' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully', type: GetCouponsResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupons not found' })
    @Get('coupons/users/:userId')
    async getCouponsCreatedByUser(@Param('userId') userId: string, @Res() res: Response) {
        try {
            const coupons: GetCouponsResponseDto = await this.couponService.getCouponsCreatedByUser(userId);

            res.status(coupons.code).send({
                status: coupons.status,
                code: coupons.code,
                message: coupons.message,
                data: coupons.data.result,
            });

        } catch (error) {
            console.error('Error retrieving coupons by user ID:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Error retrieving coupons by user ID',
                data: {},
            });
        }
    }



    @ApiTags('Coupons')
    @ApiOperation({ summary: 'Retrieve all coupons' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully', type: GetCouponsResponseDto })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupons not found' })
    @Get('coupons')
    async getAllCoupons(@Res() res: Response) {
        try {
            const coupons: GetCouponsResponseDto = await this.couponService.getCoupons();

            res.status(coupons.code).send({
                status: 'success',
                code: 200,
                message: 'Coupons retrieved successfully',
                data: coupons,
            });

        } catch (error) {
            console.error('Error retrieving coupons:', error);

            res.status(400).send({
                status: 'error',
                code: 400,
                message: 'Bad Request: Error retrieving coupons',
                data: {},
            });
        }
    }





}