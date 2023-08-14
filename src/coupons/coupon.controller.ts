import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { AssignCouponDto } from "./dto/assignCoupon.dto";
import { AssignCouponResponseDto } from "./dto/assignCouponResponse.dto";
import { CouponStatus, CreateCouponDto } from "./dto/createCoupon.dto";
import { CreateCouponResponseDto } from "./dto/createCouponResponse.dto";
import { DeleteCouponResponseDto } from "./dto/deleteCouponResponse.dto";
import { GetCouponsResponseDto } from "./dto/getCouponsResponse.dto";
import { RedeemCouponDto } from "./dto/redeemCoupon.dto";
import { RedeemCouponResponseDto } from "./dto/redeemCouponResponse.dto";
import { SetCouponAsExpiredResponseDto } from "./dto/setCouponAsExpiredResponse.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";
import { UpdateCouponResponseDto } from "./dto/updateCouponResponse.dto";




@Controller()
export class CouponController {
    constructor(private readonly couponService: CouponService) { }


    @Post('firebase/coupons')
    async createCoupon(@Body() createCouponDto: CreateCouponDto): Promise<CreateCouponResponseDto> {
        return this.couponService.createNewCoupon(createCouponDto);
    }



    @Put('firebase/coupons/:code')
    async updateCoupon(
        @Param('code') code: string,
        @Body() updateCouponDto: UpdateCouponDto,
    ): Promise<UpdateCouponResponseDto> {
        return this.couponService.updateCoupon(code, updateCouponDto);
    }



    @Delete('firebase/coupons/:code')
    async deleteCoupon(@Param('code') code: string): Promise<DeleteCouponResponseDto> {
        return this.couponService.deleteCoupon(code);
    }



    @Get('firebase/coupons')
    async getCoupons(): Promise<GetCouponsResponseDto> {
        return this.couponService.getCoupons();
    }


    @Post('firebase/coupons/redeem')
    async redeemCoupon(@Body() redeemCouponDto: RedeemCouponDto): Promise<RedeemCouponResponseDto> {
        const response = await this.couponService.redeemCoupon(redeemCouponDto);
        return response;
    }





    @Post('firebase/coupons/assign')
    async assignCouponToUser(@Body() assignCouponDto: AssignCouponDto): Promise<AssignCouponResponseDto> {
        return this.couponService.assignCouponToUser(assignCouponDto);
    }



    @Get('firebase/coupons/:code')
    async getCouponByCode(@Param('code') code: string): Promise<GetCouponsResponseDto> {
        return this.couponService.getCouponByCode(code);
    }



    @Get('firebase/coupons/users/:email/:status')
    async filterCouponsByStatusAndUser(
        @Param('status') status: CouponStatus,
        @Param('email') email: string
    ): Promise<GetCouponsResponseDto> {
        return this.couponService.filterCouponsByStatus(status, email);
    }



    @Post('firebase/coupons/update-expired')
    async updateExpiredCouponsStatus(): Promise<SetCouponAsExpiredResponseDto> {
        return this.couponService.updateExpiredCouponsStatus();
    }


    @Post('firebase/coupons/update-expired/:userEmail')
    async updateExpiredCouponsStatusForUser(@Param('userEmail') userEmail: string): Promise<SetCouponAsExpiredResponseDto> {
        return this.couponService.updateUserExpiredCouponsStatus(userEmail);
    }




    @Get('firebase/coupons/users/:userEmail')
    async getCouponsByUser(@Param('userEmail') userEmail: string): Promise<GetCouponsResponseDto> {
        return this.couponService.getCouponsByUser(userEmail);
    }



    @Delete('firebase/coupons/users/:userEmail/expired-used')
    async deleteExpiredAndUsedCouponsFromUser(@Param('userEmail') userEmail: string): Promise<DeleteCouponResponseDto> {
        return this.couponService.deleteExpiredAndUsedCouponsFromUser(userEmail);
    }


    @Delete('firebase/coupons/expired/cleanup')
    async deleteExpiredCouponsFromFirebase(): Promise<DeleteCouponResponseDto> {
        return this.couponService.deleteExpiredCouponsFromFirebase();
    }


}