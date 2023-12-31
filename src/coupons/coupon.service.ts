import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import {CreateCouponDto } from "./dto/createCoupon.dto";
import { CreateCouponResponseDto } from "./dto/createCouponResponse.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";
import { UpdateCouponResponseDto } from "./dto/updateCouponResponse.dto";
import { Coupon, CouponStatus, DiscountType } from "./entities/coupon.entity";
import * as admin from 'firebase-admin';
import { DeleteCouponResponseDto } from "./dto/deleteCouponResponse.dto";
import { GetCouponsResponseDto } from "./dto/getCouponsResponse.dto";
import { RedeemCouponDto, ResourceType } from "./dto/redeemCoupon.dto";
import { RedeemCouponResponseDto } from "./dto/redeemCouponResponse.dto";
import { AssignCouponDto } from "./dto/assignCoupon.dto";
import { AssignCouponResponseDto } from "./dto/assignCouponResponse.dto";
import { SetCouponAsExpiredResponseDto } from "./dto/setCouponAsExpiredResponse.dto";
import { User } from "../users/users.entity";
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";



@Injectable()
export class CouponService {

    constructor(private firebaseService: FirebaseService) { }




    @ApiOperation({ summary: 'Create a new coupon' })
    @ApiOkResponse({ description: 'Coupon created successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createNewCoupon(createCouponDto: CreateCouponDto): Promise<CreateCouponResponseDto> {
        try {
            const { code, description, discountType, discountAmount, expiryDate, maxUses, maxUsesPerUser, assetId, status} = createCouponDto;
            const createdBy = createCouponDto.createdBy;
            const couponRef = collection(this.firebaseService.fireStore, 'coupons');

            const existingCouponQuery = query(couponRef, where('code', '==', code));
            const existingCouponQuerySnapshot = await getDocs(existingCouponQuery);
            if (!existingCouponQuerySnapshot.empty) {
                const response: CreateCouponResponseDto = {
                    statusCode: 400,
                    message: 'COUPON_ALREADY_EXISTS',
                };
                return response;
            }

            const currentDate = new Date();
            const expiryDateObj = new Date(expiryDate);

            if (expiryDateObj <= currentDate) {
                const response: CreateCouponResponseDto = {
                    statusCode: 400,
                    message: 'EXPIRY_DATE_INVALID',
                };
                return response;
            }

            if (!Object.values(CouponStatus).includes(status)) {
                const response: CreateCouponResponseDto = {
                    statusCode: 400,
                    message: 'INVALID_STATUS',
                };
                return response;
            }

            if (!Object.values(DiscountType).includes(discountType)) {
                const response: CreateCouponResponseDto = {
                    statusCode: 400,
                    message: 'INVALID_DISCOUNT_TYPE',
                };
                return response;
            }

            const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
            const courseRef = collection(this.firebaseService.fireStore, 'courses');


            const ebookQuery = query(ebookRef, where('id', '==', assetId));
            const ebookQuerySnapshot = await getDocs(ebookQuery);

            const courseQuery = query(courseRef, where('id', '==', assetId));
            const courseQuerySnapshot = await getDocs(courseQuery);

            if (ebookQuerySnapshot.empty && courseQuerySnapshot.empty) {
                throw new BadRequestException('ASSET_DOES_NOT_EXIST');
            }

            console.log('createCouponDto:', createCouponDto);
            console.log(createdBy);


            const newCoupon: Coupon = {
                code,
                description,
                discountType,
                discountAmount,
                expiryDate,
                maxUses,
                maxUsesPerUser,
                status,
                currentUses: 0,
                assetId,
                redeemedByUsers: [],
                createdBy: createdBy,
               
            };

            const newCouponDocRef = await addDoc(couponRef, newCoupon);

            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            cachedCoupons.push(newCoupon);
            this.firebaseService.setCollectionData('coupons', cachedCoupons);

            const responseDto = new CreateCouponResponseDto(201, 'COUPONCREATEDSUCCESSFULLY', code);
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof BadRequestException) {
                throw error;
            } else {
                const response: CreateCouponResponseDto = {
                    statusCode: 400,
                    message: 'COUPON_CREATION_FAILED. INVALID INPUT',
                };
                return response;
            }
        }
    }



    @ApiOperation({ summary: 'Update a coupon' })
    @ApiOkResponse({ description: 'Coupon updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async updateCoupon(code: string, newData: Partial<UpdateCouponDto>): Promise<UpdateCouponResponseDto> {
        try {

            const {
                code: newCode,
                description,
                discountType,
                discountAmount,
                expiryDate,
                maxUses,
                maxUsesPerUser,
                status,
                currentUses,
                assetId,
            } = newData;




            console.log('Initializing updateCoupon...');
            const couponsCollectionRef = admin.firestore().collection('coupons');

            const querySnapshot = await couponsCollectionRef.where('code', '==', code).get();

            if (querySnapshot.empty) {
                console.log(`The coupon with the code "${code}" does not exist.`);
                const response: UpdateCouponResponseDto = {
                    statusCode: 404,
                    message: 'Coupon not found',
                };
                return response;
            }



            const couponDoc = querySnapshot.docs[0];

            const couponData = couponDoc.data();


            if (newCode !== undefined && typeof newCode === 'string') {
                couponData.code = newCode;
            }

            if (description !== undefined && typeof description === 'string') {
                couponData.description = description;
            }

            if (discountType !== undefined && Object.values(DiscountType).includes(discountType)) {
                couponData.discountType = discountType;
            }

            if (discountAmount !== undefined && typeof discountAmount === 'number' && discountAmount >= 0) {
                couponData.discountAmount = discountAmount;
            }

            if (expiryDate !== undefined && (expiryDate === null || new Date(expiryDate).toString() !== 'Invalid Date')) {
                couponData.expiryDate = expiryDate;
            }

            if (maxUses !== undefined && typeof maxUses === 'number' && maxUses > 0) {
                couponData.maxUses = maxUses;
            }

            if (maxUsesPerUser !== undefined && typeof maxUsesPerUser === 'number' && maxUsesPerUser > 0) {
                couponData.maxUsesPerUser = maxUsesPerUser;
            }

            if (status !== undefined && Object.values(CouponStatus).includes(status)) {
                couponData.status = status;
            }

            if (currentUses !== undefined && typeof currentUses === 'number' && currentUses >= 0) {
                couponData.currentUses = currentUses;
            }

            if (assetId !== undefined && typeof assetId === 'string') {
                couponData.assetId = assetId;
            }

            // Update the coupon data
            const updatedData = { ...couponData, ...newData };

            // Update in Firestore
            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, updatedData);
            });

            await batch.commit();

            // Update the cache
            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            const updatedCouponIndex = cachedCoupons.findIndex((coupon) => coupon.code === code);
            if (updatedCouponIndex !== -1) {
                cachedCoupons[updatedCouponIndex] = { ...cachedCoupons[updatedCouponIndex], ...newData };
                this.firebaseService.setCollectionData('coupons', cachedCoupons);
            }

            const response: UpdateCouponResponseDto = {
                statusCode: 200,
                message: 'COUPONUPDATEDSUCCESSFULLY',
            };

            return response;
        } catch (error) {
            console.error('There was an error updating the coupon data:', error);
            throw error;
        }
    }


    @ApiOperation({ summary: 'Retrieve all coupons' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getCoupons(): Promise<GetCouponsResponseDto> {
        try {
            console.log('Initializing getCoupons...');

            // If there is no data, it uses firestore instead
            const couponsRef = this.firebaseService.couponsCollection;
            const couponsQuery = query(couponsRef, orderBy("code"));
            console.log('Coupons query created.');

            const couponsQuerySnapshot = await getDocs(couponsQuery);
            console.log('Coupons query snapshot obtained.');

            let queryResult = [];
            couponsQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                queryResult.push({
                    createdBy: data.createdBy,
                    code: data.code,
                    description: data.description,
                    discountType: data.discountType,
                    discountAmount: data.discountAmount,
                    expiryDate: data.expiryDate,
                    maxUses: data.maxUses,
                    maxUsesPerUser: data.maxUsesPerUser,
                    status: data.status,
                    currentUses: data.currentUses,
                    redeemedByUsers: data.redeemedByUsers
                });
            });
            console.log('Coupons data collected.');

            const getCouponsDtoResponse: GetCouponsResponseDto = {
                statusCode: 200,
                message: "COUPONSGOT",
                couponsFound: queryResult,
            };
            console.log('Response created.');

            return getCouponsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the coupons.');
        }
    }



    @ApiOperation({ summary: 'Redeem a coupon' })
    @ApiOkResponse({ description: 'Coupon redeemed successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async redeemCoupon(redeemCouponDto: RedeemCouponDto, userId: string): Promise<RedeemCouponResponseDto> {
        try {
            const { couponCode, resourceType } = redeemCouponDto;

            if (!Object.values(ResourceType).includes(resourceType)) {
                const response: RedeemCouponResponseDto = {
                    statusCode: 400,
                    message: 'INVALID_RESOURCE_TYPE',
                    discountedPrice: 0,
                    initialPrice: 0,
                };
                return response;
            }

            // Fetch coupon data from Firestore
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', couponCode)));

            if (couponQuerySnapshot.empty) {
                const response: RedeemCouponResponseDto = {
                    statusCode: 400,
                    message: 'COUPON NOT FOUND',
                    discountedPrice: 0,
                    initialPrice: 0,
                };
                return response;            }

            const couponDoc = couponQuerySnapshot.docs[0];
            const couponData = couponDoc.data();

            if (couponData.status !== CouponStatus.Available) {
                const response: RedeemCouponResponseDto = {
                    statusCode: 400,
                    message: 'COUPON NOT AVAILABLE FOR REDEMPTION',
                    discountedPrice: 0,
                    initialPrice: 0,
                };
                return response;            }

            // Fetch user data from Firestore based on ID
            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(userCollectionRef, where('id', '==', userId)));

            if (userQuerySnapshot.empty) {
                const response: RedeemCouponResponseDto = {
                    statusCode: 400,
                    message: 'USER DOES NOT EXIST',
                    discountedPrice: 0,
                    initialPrice: 0,
                };
                return response;            }

            // Verify if the coupon has reached its max uses
            if (couponData.currentUses >= couponData.maxUses) {
                await updateDoc(couponDoc.ref, {
                    status: CouponStatus.OutOfStock
                });

                throw new BadRequestException('This coupon has reached its max uses, it cannot be redeemed anymore.');
            }

            // Verify if the user has reached max uses per person for this coupon
            if (couponData.redeemedByUsers && couponData.redeemedByUsers.filter(id => id === userId).length >= couponData.maxUsesPerUser) {
                throw new BadRequestException('The user has reached the max uses per person for this coupon.');
            }

            // Fetch the specified resource based on resourceType and assetId
            let resourcePrice = 0;
            if (resourceType === "Course") {
                const courseCollectionRef = collection(this.firebaseService.fireStore, 'courses');
                const courseQuerySnapshot = await getDocs(query(courseCollectionRef, where('id', '==', couponData.assetId)));

                if (courseQuerySnapshot.empty) {
                    throw new NotFoundException(`Course with id "${couponData.assetId}" not found.`);
                }

                const courseData = courseQuerySnapshot.docs[0].data();
                resourcePrice = courseData.price;
            } else if (resourceType === "Ebook") {
                const ebookCollectionRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuerySnapshot = await getDocs(query(ebookCollectionRef, where('id', '==', couponData.assetId)));

                if (ebookQuerySnapshot.empty) {
                    throw new NotFoundException(`Ebook with id "${couponData.assetId}" not found.`);
                }

                const ebookData = ebookQuerySnapshot.docs[0].data();
                resourcePrice = ebookData.price;
            }

            // Calculate the final price based on coupon discount
            const initialPrice = resourcePrice;
            let finalPrice = resourcePrice;

            if (couponData.discountType === "nominal") {
                finalPrice -= couponData.discountAmount;
                console.log(`Initial Price: ${initialPrice}, Discount Applied: ${couponData.discountAmount}, Final Price: ${finalPrice}`);
            } else if (couponData.discountType === "percentual") {
                const discountPercentage = couponData.discountAmount / 100;
                const discountAmount = finalPrice * discountPercentage;
                finalPrice -= discountAmount;
                console.log(`Initial Price: ${initialPrice}, Discount Applied: ${discountAmount} (${couponData.discountAmount}%), Final Price: ${finalPrice}`);
            }

            console.log('Coupon successfully redeemed.');

            // Update the coupon data
            await updateDoc(couponDoc.ref, {
                currentUses: couponData.currentUses + 1,
                redeemedByUsers: [...(couponData.redeemedByUsers || []), userId],
            });

            const response: RedeemCouponResponseDto = new RedeemCouponResponseDto(201, "COUPON_REDEEMED_SUCCESSFULLY", finalPrice, initialPrice);
            return response;
        } catch (error) {
            console.error("An error occurred:", error);
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new BadRequestException('There was an error redeeming the coupon.');
            }
        }
    }



    @ApiOperation({ summary: 'Retrieve a coupon by code' })
    @ApiOkResponse({ description: 'Coupon retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getCouponByCode(code: string): Promise<GetCouponsResponseDto> {
        try {
            // If not found in cache, fetch from Firestore
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', code)));

            if (couponQuerySnapshot.empty) {
                const response: GetCouponsResponseDto = {
                    statusCode: 404,
                    message: 'COUPON NOT FOUND',
                    couponsFound: []
                };
                return response;            }

            const couponData = couponQuerySnapshot.docs[0].data();

            const getCouponDtoResponse: GetCouponsResponseDto = {
                statusCode: 200,
                message: "COUPONSGOT",
                couponsFound: [couponData],
            };

            return getCouponDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error(`There was an error retrieving the coupon with code "${code}".`);
        }
    }


    @ApiOperation({ summary: 'Retrieve coupons by a status' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async filterCouponsByStatus(filterStatus: CouponStatus, id: string): Promise<GetCouponsResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const userQuery = query(usersRef, where('id', '==', id), limit(1));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                throw new NotFoundException(`User with ID "${id}" not found.`);
            }

            const userData = userQuerySnapshot.docs[0].data();
            const userCoupons = userData.coupons || [];

            const filteredUserCoupons = userCoupons.filter(coupon => coupon.status === filterStatus);

            const filterCouponsDtoResponse: GetCouponsResponseDto = {
                statusCode: 200,
                message: "COUPONSGOT",
                couponsFound: filteredUserCoupons,
            };

            return filterCouponsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error(`There was an error filtering coupons by status "${filterStatus}".`);
        }
    }





    @ApiOperation({ summary: 'Updates a coupons status to expired' })
    @ApiOkResponse({ description: 'Coupon updated successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async updateExpiredCouponsStatus(): Promise<SetCouponAsExpiredResponseDto> {
        try {
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(couponCollectionRef);

            const currentDate = new Date();
            const expiredCoupons: Coupon[] = [];
            const updatedCachedCoupons: Coupon[] = [];

            for (const couponDoc of couponQuerySnapshot.docs) {
                const couponData = couponDoc.data() as Coupon;

                console.log(`Processing coupon with code: ${couponData.code}`);

                if (couponData.expiryDate) {
                    console.log(`Coupon expiryDate: ${couponData.expiryDate}`);
                    if (this.isCouponExpired(couponData.expiryDate, currentDate)) {
                        console.log(`Coupon with code ${couponData.code} is expired.`);
                        expiredCoupons.push({ ...couponData, status: CouponStatus.Expired });

                        // Update the status of the expired coupon directly in Firestore
                        await updateDoc(couponDoc.ref, { status: CouponStatus.Expired });
                    } else {
                        console.log(`Coupon with code ${couponData.code} is still valid.`);
                        updatedCachedCoupons.push(couponData);
                    }
                } else {
                    console.log(`Coupon with code ${couponData.code} does not have an expiryDate.`);
                    updatedCachedCoupons.push(couponData);
                }
            }

            console.log(`Updating cache with ${expiredCoupons.length} expired coupons and ${updatedCachedCoupons.length} valid coupons.`);

            // Update the cache with the updated coupon statuses
            this.firebaseService.setCollectionData('coupons', [...updatedCachedCoupons, ...expiredCoupons]);

            const response: SetCouponAsExpiredResponseDto = new SetCouponAsExpiredResponseDto(200, "COUPONSUPDATEDSUCCESSFULLY");
            return response;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error updating expired coupons status.');
        }
    }



    private isCouponExpired(expiryDate: Date, currentDate: Date): boolean {
        console.log('Expiry Date:', expiryDate);

        const expiryDateObj = new Date(expiryDate);
        const expiryTimestamp = expiryDateObj.getTime();
        console.log('Expiry Timestamp:', expiryTimestamp);

        const currentTimestamp = currentDate.getTime();
        console.log('Current Timestamp:', currentTimestamp);

        const isExpired = expiryTimestamp <= currentTimestamp;
        console.log('Is Expired:', isExpired);

        return isExpired;
    }



    
    @ApiOperation({ summary: 'Retrieve all coupons created by a user' })
    @ApiOkResponse({ description: 'Coupons retrieved successfully' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getCouponsCreatedByUser(userId: string): Promise<GetCouponsResponseDto> {
        try {
            const couponsCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponsQuerySnapshot = await getDocs(query(couponsCollectionRef, where('createdBy', '==', userId)));

            const userCoupons = [];

            couponsQuerySnapshot.forEach((couponDoc) => {
                const couponData = couponDoc.data();
                userCoupons.push(couponData);
            });

            if (userCoupons.length === 0) {
                const getCouponsDtoResponse: GetCouponsResponseDto = {
                    statusCode: 404,
                    message: "USER HAS NO REGISTERED COUPONS",
                    couponsFound: []
                };

                return getCouponsDtoResponse;            }


            const getCouponsDtoResponse: GetCouponsResponseDto = {
                statusCode: 200,
                message: "COUPONSGOT",
                couponsFound: userCoupons,
            };

            return getCouponsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error(`There was an error retrieving coupons created by user "${userId}".`);
        }
    }





   


}
