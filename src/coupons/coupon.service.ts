import { Injectable } from '@nestjs/common';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateCouponDto } from './dto/createCoupon.dto';
import { CreateCouponResponseDto } from './dto/createCouponResponse.dto';
import { UpdateCouponDto } from './dto/updateCoupon.dto';
import { UpdateCouponResponseDto } from './dto/updateCouponResponse.dto';
import { Coupon, CouponStatus, DiscountType } from './entities/coupon.entity';
import * as admin from 'firebase-admin';
import { GetCouponsResponseDto } from './dto/getCouponsResponse.dto';
import { RedeemCouponDto, ResourceType } from './dto/redeemCoupon.dto';
import { RedeemCouponResponseDto } from './dto/redeemCouponResponse.dto';
import { SetCouponAsExpiredResponseDto } from './dto/setCouponAsExpiredResponse.dto';

@Injectable()
export class CouponService {
  constructor(private firebaseService: FirebaseService) {}

  async createNewCoupon(
    createCouponDto: CreateCouponDto,
  ): Promise<CreateCouponResponseDto> {
    try {
      const {
        code,
        description,
        discountType,
        discountAmount,
        expiryDate,
        maxUses,
        maxUsesPerUser,
        assetId,
        status,
      } = createCouponDto;
      const createdBy = createCouponDto.createdBy;
      const couponRef = collection(this.firebaseService.fireStore, 'coupons');

      const existingCouponQuery = query(couponRef, where('code', '==', code));
      const existingCouponQuerySnapshot = await getDocs(existingCouponQuery);
      if (!existingCouponQuerySnapshot.empty) {
        const response: CreateCouponResponseDto = new CreateCouponResponseDto(
          'error',
          400,
          'A coupon with that code already exists, use a different one.',
          {},
        );
        return response;
      }

      const currentDate = new Date();
      const expiryDateObj = new Date(expiryDate);

      if (expiryDateObj <= currentDate) {
        const response: CreateCouponResponseDto = new CreateCouponResponseDto(
          'error',
          400,
          'The expiry date is invalid, use a different one.',
          {},
        );
        return response;
      }

      if (!Object.values(CouponStatus).includes(status)) {
        const response: CreateCouponResponseDto = new CreateCouponResponseDto(
          'error',
          400,
          'The status is invalid.',
          {},
        );
        return response;
      }

      if (!Object.values(DiscountType).includes(discountType)) {
        const response: CreateCouponResponseDto = new CreateCouponResponseDto(
          'error',
          400,
          'The discount type is invalid.',
          {},
        );
        return response;
      }

      const ebookRef = collection(this.firebaseService.fireStore, 'ebooks');
      const courseRef = collection(this.firebaseService.fireStore, 'courses');

      const ebookQuery = query(ebookRef, where('id', '==', assetId));
      const ebookQuerySnapshot = await getDocs(ebookQuery);

      const courseQuery = query(courseRef, where('id', '==', assetId));
      const courseQuerySnapshot = await getDocs(courseQuery);

      if (ebookQuerySnapshot.empty && courseQuerySnapshot.empty) {
        const response: CreateCouponResponseDto = new CreateCouponResponseDto(
          'error',
          404,
          'The asset does not exist',
          {},
        );
        return response;
      }

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

      const cachedCoupons = await this.firebaseService.getCollectionData(
        'coupons',
      );
      cachedCoupons.push(newCoupon);
      this.firebaseService.setCollectionData('coupons', cachedCoupons);

      const responseDto = new CreateCouponResponseDto(
        'success',
        201,
        'The coupon was created successfully.',
        { code },
      );
      return responseDto;
    } catch (error) {
      console.error('Error while creating a coupon:', error);
      const response: CreateCouponResponseDto = new CreateCouponResponseDto(
        'error',
        400,
        'There was an error with the request, try again.',
        {},
      );
      return response;
    }
  }

  async updateCoupon(
    code: string,
    newData: Partial<UpdateCouponDto>,
  ): Promise<UpdateCouponResponseDto> {
    try {
      console.log('Initializing updateCoupon...');
      const couponsCollectionRef = admin.firestore().collection('coupons');

      const querySnapshot = await couponsCollectionRef
        .where('code', '==', code)
        .get();

      if (querySnapshot.empty) {
        console.log(`The coupon with the code "${code}" does not exist.`);
        const response: UpdateCouponResponseDto = {
          status: 'error',
          code: 404,
          message: 'Coupon not found',
          data: {
            result: {},
          },
        };
        return response;
      }

      const couponDoc = querySnapshot.docs[0];
      const couponData = couponDoc.data();

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

      if (newCode !== undefined && typeof newCode === 'string') {
        couponData.code = newCode;
      }

      if (description !== undefined && typeof description === 'string') {
        couponData.description = description;
      }

      if (
        discountType !== undefined &&
        Object.values(DiscountType).includes(discountType)
      ) {
        couponData.discountType = discountType;
      }

      if (
        discountAmount !== undefined &&
        typeof discountAmount === 'number' &&
        discountAmount >= 0
      ) {
        couponData.discountAmount = discountAmount;
      }

      if (
        expiryDate !== undefined &&
        (expiryDate === null ||
          new Date(expiryDate).toString() !== 'Invalid Date')
      ) {
        couponData.expiryDate = expiryDate;
      }

      if (maxUses !== undefined && typeof maxUses === 'number' && maxUses > 0) {
        couponData.maxUses = maxUses;
      }

      if (
        maxUsesPerUser !== undefined &&
        typeof maxUsesPerUser === 'number' &&
        maxUsesPerUser > 0
      ) {
        couponData.maxUsesPerUser = maxUsesPerUser;
      }

      if (
        status !== undefined &&
        Object.values(CouponStatus).includes(status)
      ) {
        couponData.status = status;
      }

      if (
        currentUses !== undefined &&
        typeof currentUses === 'number' &&
        currentUses >= 0
      ) {
        couponData.currentUses = currentUses;
      }

      if (assetId !== undefined && typeof assetId === 'string') {
        couponData.assetId = assetId;
      }

      const updatedData = { ...couponData, ...newData };

      const batch = admin.firestore().batch();
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, updatedData);
      });

      await batch.commit();

      const cachedCoupons = await this.firebaseService.getCollectionData(
        'coupons',
      );
      const updatedCouponIndex = cachedCoupons.findIndex(
        (coupon) => coupon.code === code,
      );
      if (updatedCouponIndex !== -1) {
        cachedCoupons[updatedCouponIndex] = {
          ...cachedCoupons[updatedCouponIndex],
          ...newData,
        };
        this.firebaseService.setCollectionData('coupons', cachedCoupons);
      }

      const response: UpdateCouponResponseDto = {
        status: 'success',
        code: 200,
        message: 'Coupon updated successfully',
        data: {
          result: {},
        },
      };

      return response;
    } catch (error) {
      console.error('There was an error updating the coupon data:', error);
      const response: UpdateCouponResponseDto = {
        status: 'error',
        code: 400,
        message: 'There was an error updating the coupon.',
        data: {
          result: {},
        },
      };
      return response;
    }
  }

  async getCoupons(): Promise<GetCouponsResponseDto> {
    try {
      console.log('Initializing getCoupons...');

      const couponsRef = this.firebaseService.couponsCollection;
      const couponsQuery = query(couponsRef, orderBy('code'));
      console.log('Coupons query created.');

      const couponsQuerySnapshot = await getDocs(couponsQuery);
      console.log('Coupons query snapshot obtained.');

      const queryResult = [];
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
          redeemedByUsers: data.redeemedByUsers,
        });
      });
      console.log('Coupons data collected.');

      const getCouponsDtoResponse: GetCouponsResponseDto = {
        status: 'success',
        code: 200,
        message: 'Coupons retrieved successfully',
        data: {
          result: queryResult,
        },
      };

      return getCouponsDtoResponse;
    } catch (error) {
      console.error('An error occurred:', error);
      const getCouponsDtoResponse: GetCouponsResponseDto = {
        status: 'error',
        code: 400,
        message: 'There was an error retrieving the coupons',
        data: {
          result: {},
        },
      };

      return getCouponsDtoResponse;
    }
  }

  async redeemCoupon(
    redeemCouponDto: RedeemCouponDto,
    userId: string,
  ): Promise<RedeemCouponResponseDto> {
    try {
      const { couponCode, resourceType } = redeemCouponDto;

      if (!Object.values(ResourceType).includes(resourceType)) {
        const response: RedeemCouponResponseDto = {
          status: 'error',
          code: 400,
          message: 'Bad request. Invalid resource type.',
          data: {
            result: {
              discountedPrice: 0,
              initialPrice: 0,
            },
          },
        };
        return response;
      }

      const couponCollectionRef = collection(
        this.firebaseService.fireStore,
        'coupons',
      );
      const couponQuerySnapshot = await getDocs(
        query(couponCollectionRef, where('code', '==', couponCode)),
      );

      if (couponQuerySnapshot.empty) {
        const response: RedeemCouponResponseDto = {
          status: 'error',
          code: 404,
          message: 'Bad request. Coupon not found',
          data: {
            result: {
              discountedPrice: 0,
              initialPrice: 0,
            },
          },
        };
        return response;
      }

      const couponDoc = couponQuerySnapshot.docs[0];
      const couponData = couponDoc.data();

      if (couponData.status !== CouponStatus.Available) {
        const response: RedeemCouponResponseDto = {
          status: 'error',
          code: 400,
          message: 'Bad request. The coupon is not available for redemption.',
          data: {
            result: {
              discountedPrice: 0,
              initialPrice: 0,
            },
          },
        };
        return response;
      }

      const userCollectionRef = collection(
        this.firebaseService.fireStore,
        'users',
      );
      const userQuerySnapshot = await getDocs(
        query(userCollectionRef, where('id', '==', userId)),
      );

      if (userQuerySnapshot.empty) {
        const response: RedeemCouponResponseDto = {
          status: 'error',
          code: 404,
          message: 'Bad request.The user does not exist.',
          data: {
            result: {
              discountedPrice: 0,
              initialPrice: 0,
            },
          },
        };
        return response;
      }

      if (couponData.currentUses >= couponData.maxUses) {
        await updateDoc(couponDoc.ref, {
          status: CouponStatus.OutOfStock,
        });

        const response: RedeemCouponResponseDto = {
          status: 'error',
          code: 400,
          message:
            'The coupon has reached its max uses, it cannot be redeemed anymore.',
          data: {
            result: {
              discountedPrice: 0,
              initialPrice: 0,
            },
          },
        };
        return response;
      }

      if (
        couponData.redeemedByUsers &&
        couponData.redeemedByUsers.filter((id) => id === userId).length >=
          couponData.maxUsesPerUser
      ) {
        const response: RedeemCouponResponseDto = {
          status: 'error',
          code: 400,
          message:
            'The user has reached the maximum uses per user for the coupon. Redemption failed.',
          data: {
            result: {
              discountedPrice: 0,
              initialPrice: 0,
            },
          },
        };
        return response;
      }

      let resourcePrice = 0;
      if (resourceType === 'Course') {
        const courseCollectionRef = collection(
          this.firebaseService.fireStore,
          'courses',
        );
        const courseQuerySnapshot = await getDocs(
          query(courseCollectionRef, where('id', '==', couponData.assetId)),
        );

        if (courseQuerySnapshot.empty) {
          const response: RedeemCouponResponseDto = {
            status: 'error',
            code: 404,
            message: 'Course with given id not found.',
            data: {
              result: {
                discountedPrice: 0,
                initialPrice: 0,
              },
            },
          };
          return response;
        }

        const courseData = courseQuerySnapshot.docs[0].data();
        resourcePrice = courseData.price;
      } else if (resourceType === 'Ebook') {
        const ebookCollectionRef = collection(
          this.firebaseService.fireStore,
          'ebooks',
        );
        const ebookQuerySnapshot = await getDocs(
          query(ebookCollectionRef, where('id', '==', couponData.assetId)),
        );

        if (ebookQuerySnapshot.empty) {
          const response: RedeemCouponResponseDto = {
            status: 'error',
            code: 404,
            message: 'Ebook with given id not found.',
            data: {
              result: {
                discountedPrice: 0,
                initialPrice: 0,
              },
            },
          };
          return response;
        }

        const ebookData = ebookQuerySnapshot.docs[0].data();
        resourcePrice = ebookData.price;
      }

      const initialPrice = resourcePrice;
      let finalPrice = resourcePrice;

      if (couponData.discountType === 'nominal') {
        finalPrice -= couponData.discountAmount;
        console.log(
          `Initial Price: ${initialPrice}, Discount Applied: ${couponData.discountAmount}, Final Price: ${finalPrice}`,
        );
      } else if (couponData.discountType === 'percentual') {
        const discountPercentage = couponData.discountAmount / 100;
        const discountAmount = finalPrice * discountPercentage;
        finalPrice -= discountAmount;
        console.log(
          `Initial Price: ${initialPrice}, Discount Applied: ${discountAmount} (${couponData.discountAmount}%), Final Price: ${finalPrice}`,
        );
      }

      console.log('Coupon successfully redeemed.');

      await updateDoc(couponDoc.ref, {
        currentUses: couponData.currentUses + 1,
        redeemedByUsers: [...(couponData.redeemedByUsers || []), userId],
      });

      const response: RedeemCouponResponseDto = {
        status: 'success',
        code: 200,
        message: 'The coupon was redeemed successfully.',
        data: {
          result: {
            discountedPrice: finalPrice,
            initialPrice: Number(Number(initialPrice).toFixed(2)),
          },
        },
      };
      return response;
    } catch (error) {
      console.error('An error occurred:', error);
      const response: RedeemCouponResponseDto = {
        status: 'error',
        code: 404,
        message: 'The request could not be proccessed.',
        data: {
          result: {
            discountedPrice: 0,
            initialPrice: 0,
          },
        },
      };
      return response;
    }
  }

  async getCouponByCode(code: string): Promise<GetCouponsResponseDto> {
    try {
      const couponCollectionRef = collection(
        this.firebaseService.fireStore,
        'coupons',
      );
      const couponQuerySnapshot = await getDocs(
        query(couponCollectionRef, where('code', '==', code)),
      );

      if (couponQuerySnapshot.empty) {
        return new GetCouponsResponseDto('error', 404, 'Coupon not found.', {});
      }

      const couponData = couponQuerySnapshot.docs[0].data();

      return new GetCouponsResponseDto(
        'success',
        200,
        'Coupon retrieved successfully.',
        couponData,
      );
    } catch (error) {
      console.error('An error occurred:', error);
      return new GetCouponsResponseDto(
        'error',
        400,
        'There was an error retrieving the coupon data.',
        {},
      );
    }
  }

  async filterCouponsByStatus(
    filterStatus: CouponStatus,
    id: string,
  ): Promise<GetCouponsResponseDto> {
    try {
      const usersRef = this.firebaseService.usersCollection;
      const userQuery = query(usersRef, where('id', '==', id), limit(1));
      const userQuerySnapshot = await getDocs(userQuery);

      if (userQuerySnapshot.empty) {
        return new GetCouponsResponseDto(
          'error',
          404,
          'User with given ID not found',
          {},
        );
      }

      const userData = userQuerySnapshot.docs[0].data();
      const userCoupons = userData.coupons || [];

      const filteredUserCoupons = userCoupons.filter(
        (coupon) => coupon.status === filterStatus,
      );

      const result = { couponsFound: filteredUserCoupons };

      return new GetCouponsResponseDto(
        'success',
        200,
        'Request successfully processed.',
        result,
      );
    } catch (error) {
      console.error('An error occurred:', error);
      return new GetCouponsResponseDto(
        'error',
        400,
        'There was an error filtering the coupons',
        {},
      );
    }
  }

  async updateExpiredCouponsStatus(): Promise<SetCouponAsExpiredResponseDto> {
    try {
      const couponCollectionRef = collection(
        this.firebaseService.fireStore,
        'coupons',
      );
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
            expiredCoupons.push({
              ...couponData,
              status: CouponStatus.Expired,
            });

            await updateDoc(couponDoc.ref, { status: CouponStatus.Expired });
          } else {
            console.log(`Coupon with code ${couponData.code} is still valid.`);
            updatedCachedCoupons.push(couponData);
          }
        } else {
          console.log(
            `Coupon with code ${couponData.code} does not have an expiryDate.`,
          );
          updatedCachedCoupons.push(couponData);
        }
      }

      console.log(
        `Updating cache with ${expiredCoupons.length} expired coupons and ${updatedCachedCoupons.length} valid coupons.`,
      );

      this.firebaseService.setCollectionData('coupons', [
        ...updatedCachedCoupons,
        ...expiredCoupons,
      ]);

      const response: SetCouponAsExpiredResponseDto =
        new SetCouponAsExpiredResponseDto(
          'success',
          200,
          'The coupons were updated successfully.',
          {},
        );
      return response;
    } catch (error) {
      console.error('An error occurred:', error);
      const response: SetCouponAsExpiredResponseDto =
        new SetCouponAsExpiredResponseDto(
          'error',
          400,
          'The coupons could not be updated. Bad request.',
          {},
        );
      return response;
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

  async getCouponsCreatedByUser(
    userId: string,
  ): Promise<GetCouponsResponseDto> {
    try {
      const couponsCollectionRef = collection(
        this.firebaseService.fireStore,
        'coupons',
      );
      const couponsQuerySnapshot = await getDocs(
        query(couponsCollectionRef, where('createdBy', '==', userId)),
      );

      const userCoupons = [];

      couponsQuerySnapshot.forEach((couponDoc) => {
        const couponData = couponDoc.data();
        userCoupons.push(couponData);
      });

      if (userCoupons.length === 0) {
        return new GetCouponsResponseDto(
          'error',
          404,
          'The user has no registered coupons',
          [],
        );
      }

      return new GetCouponsResponseDto(
        'success',
        200,
        'Coupons retrieved successfully',
        userCoupons,
      );
    } catch (error) {
      console.error('An error occurred:', error);
      return new GetCouponsResponseDto(
        'error',
        400,
        'There was an error proccessing the request.',
        [],
      );
    }
  }
}
