import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CouponService } from "./coupon.service";
import { AssignCouponDto } from "./dto/assignCoupon.dto";
import { AssignCouponResponseDto } from "./dto/assignCouponResponse.dto";
import { CreateCouponDto } from "./dto/createCoupon.dto";
import { CreateCouponResponseDto } from "./dto/createCouponResponse.dto";
import { DeleteCouponResponseDto } from "./dto/deleteCouponResponse.dto";
import { GetCouponsResponseDto } from "./dto/getCouponsResponse.dto";
import { RedeemCouponDto } from "./dto/redeemCoupon.dto";
import { RedeemCouponResponseDto } from "./dto/redeemCouponResponse.dto";
import { SetCouponAsExpiredResponseDto } from "./dto/setCouponAsExpiredResponse.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";
import { UpdateCouponResponseDto } from "./dto/updateCouponResponse.dto";
import { CouponStatus } from "./entities/coupon.entity";




@Controller()
@ApiTags('Coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }


    @ApiOperation({ summary: 'Create a coupon' })
    @ApiOkResponse({ description: 'Coupon created successfully '})
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input' })
    @Post('coupons')
    async createCoupon(@Body() createCouponDto: CreateCouponDto): Promise<CreateCouponResponseDto> {
        return this.couponService.createNewCoupon(createCouponDto);
    }




    
    @ApiOperation({ summary: 'Update a coupon using its code' })
    @ApiOkResponse({ description: 'Coupon updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupon not found' })
    @Put('coupons')
    async updateCoupon(
        @Query('code') code: string,
        @Body() updateCouponDto: UpdateCouponDto,
    ): Promise<UpdateCouponResponseDto> {
        return this.couponService.updateCoupon(code, updateCouponDto);
    }







    @ApiOperation({ summary: 'Redeem a coupon' })
    @ApiOkResponse({ description: 'Coupon redeemed successfully ' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupon not found' })
    @Post('coupons/assets')
    async redeemCoupon(@Body() redeemCouponDto: RedeemCouponDto, @Query('id') id: string): Promise<RedeemCouponResponseDto> {
        const response = await this.couponService.redeemCoupon(redeemCouponDto, id);
        return response;
    }



    
    @ApiOperation({ summary: 'Sets a coupons status to expired' })
    @ApiOkResponse({ description: 'Coupons updated successfully ' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupons not found' })
    @Patch('coupons')
    async updateExpiredCouponsStatus(): Promise<SetCouponAsExpiredResponseDto> {
        return this.couponService.updateExpiredCouponsStatus();
    }


    /*
    @ApiOperation({ summary: 'Delete expired coupons from firebase' })
    @ApiOkResponse({ description: 'Coupons deleted successfully ' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupons not found' })
    @Delete('coupons')
    async deleteExpiredCouponsFromFirebase(): Promise<DeleteCouponResponseDto> {
        return this.couponService.deleteExpiredCouponsFromFirebase();
    }*/




    @ApiOperation({ summary: 'Retrieve coupons using filters or retrieve all coupons from an user' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad Request: Invalid input or coupons not found' })
    @Get('coupons')
    async getCoupons(
        @Query('code') code: string,
        @Query('status') status: CouponStatus,
        @Query('id') id: string
    ): Promise<GetCouponsResponseDto> {

        if (!code && !status && !id) {
            return this.couponService.getCoupons();
        }

        else if (code) {
            return this.couponService.getCouponByCode(code);
        } else if (id) {
            return this.couponService.getCouponsCreatedByUser(id);
        } else {
            throw new BadRequestException('Invalid parameters');
        }
    }



}