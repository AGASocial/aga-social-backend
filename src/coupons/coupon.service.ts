import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CouponStatus, CreateCouponDto } from "./dto/createCoupon.dto";
import { CreateCouponResponseDto } from "./dto/createCouponResponse.dto";
import { UpdateCouponDto } from "./dto/updateCoupon.dto";
import { UpdateCouponResponseDto } from "./dto/updateCouponResponse.dto";
import { Coupon } from "./entities/coupon.entity";
import * as admin from 'firebase-admin';
import { DeleteCouponResponseDto } from "./dto/deleteCouponResponse.dto";
import { GetCouponsResponseDto } from "./dto/getCouponsResponse.dto";
import { RedeemCouponDto } from "./dto/redeemCoupon.dto";
import { RedeemCouponResponseDto } from "./dto/redeemCouponResponse.dto";
import { AssignCouponDto } from "./dto/assignCoupon.dto";
import { AssignCouponResponseDto } from "./dto/assignCouponResponse.dto";
import { SetCouponAsExpiredResponseDto } from "./dto/setCouponAsExpiredResponse.dto";
import { User } from "../users/users.entity";



@Injectable()
export class CouponService {

    constructor(private firebaseService: FirebaseService) { }



    async createNewCoupon(createCouponDto: CreateCouponDto): Promise<CreateCouponResponseDto> {
        try {
            const { code, description, discountType, discountAmount, expiryDate, maxUses, maxUsesPerUser } = createCouponDto;
            const couponRef = collection(this.firebaseService.fireStore, 'coupons');

            const existingCouponQuery = query(couponRef, where('code', '==', code));
            const existingCouponQuerySnapshot = await getDocs(existingCouponQuery);

            if (!existingCouponQuerySnapshot.empty) {
                throw new BadRequestException('COUPON_ALREADY_EXISTS');
            }

            const currentDate = new Date();
            const expiryDateObj = new Date(expiryDate);

            if (expiryDateObj <= currentDate) {
                throw new BadRequestException('EXPIRY_DATE_INVALID');
            }



            const newCoupon: Coupon = {
                code,
                description,
                discountType,
                discountAmount,
                expiryDate,
                maxUses,
                maxUsesPerUser,
                status: CouponStatus.Available,
                currentUsesPerUser: 0,
                totalMaxUses: 0, 
               
            };

            const newCouponDocRef = await addDoc(couponRef, newCoupon);

            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            cachedCoupons.push(newCoupon);
            this.firebaseService.setCollectionData('coupons', cachedCoupons);

            const responseDto = new CreateCouponResponseDto(201, 'COUPONCREATEDSUCCESSFULLY');
            return responseDto;
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof BadRequestException) {
                throw error;
            } else {
                throw new BadRequestException('COUPON_CREATION_FAILED');
            }
        }
    }


    async updateCoupon(code: string, newData: Partial<UpdateCouponDto>): Promise<UpdateCouponResponseDto> {
        try {
            console.log('Initializing updateCoupon...');
            const couponsCollectionRef = admin.firestore().collection('coupons');

            const querySnapshot = await couponsCollectionRef.where('code', '==', code).get();

            if (querySnapshot.empty) {
                console.log(`The coupon with the code "${code}" does not exist.`);
                throw new Error('COUPONDOESNOTEXIST.');
            }

            const couponDoc = querySnapshot.docs[0];

            const couponData = couponDoc.data();

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

    //NOT IN USE
    async deleteCoupon(code: string): Promise<DeleteCouponResponseDto> {
        try {
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', code)));

            if (couponQuerySnapshot.empty) {
                console.log(`Coupon with code "${code}" not found in the coupons collection.`);
                throw new NotFoundException('COUPONNOTFOUND');
            }
            const couponDoc = couponQuerySnapshot.docs[0];

            // Delete from Firestore
            await deleteDoc(couponDoc.ref);

            // Update the cache
            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            const indexToDelete = cachedCoupons.findIndex((coupon) => coupon.code === code);

            if (indexToDelete !== -1) {
                cachedCoupons.splice(indexToDelete, 1);
                this.firebaseService.setCollectionData('coupons', cachedCoupons);
            }

            const response: DeleteCouponResponseDto = {
                statusCode: 200,
                message: 'COUPONDELETEDSUCCESSFULLY',
            };

            console.log(`The coupon has been deleted successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }




    async deactivateCoupon(code: string): Promise<DeleteCouponResponseDto> {
        try {
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', code)));

            if (couponQuerySnapshot.empty) {
                console.log(`Coupon with code "${code}" not found in the coupons collection.`);
                throw new NotFoundException('COUPONNOTFOUND');
            }
            const couponDoc = couponQuerySnapshot.docs[0];

            // Update status to "eliminated"
            await updateDoc(couponDoc.ref, { status: 'eliminated' });

            // Update the cache
            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            const indexToUpdate = cachedCoupons.findIndex((coupon) => coupon.code === code);

            if (indexToUpdate !== -1) {
                cachedCoupons[indexToUpdate].status = 'eliminated'; // Update status attribute
                this.firebaseService.setCollectionData('coupons', cachedCoupons);
            }

            const response: DeleteCouponResponseDto = {
                statusCode: 200,
                message: 'COUPONELIMINATEDSUCCESSFULLY',
            };

            console.log(`The coupon has been marked as eliminated successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }




    async deactivateCouponForUser(code: string, userEmail: string): Promise<DeleteCouponResponseDto> {
        try {
            // Fetch user data from Firestore based on email
            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(userCollectionRef, where('email', '==', userEmail)));

            if (userQuerySnapshot.empty) {
                console.log(`User with email "${userEmail}" not found.`);
                throw new NotFoundException('USERNOTFOUND');
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();

            // Find the coupon in user's coupons array
            const couponIndex = userData.coupons.findIndex((coupon) => coupon.code === code);

            if (couponIndex === -1) {
                console.log(`Coupon with code "${code}" not found in user's coupons.`);
                throw new NotFoundException('COUPONNOTFOUND');
            }

            // Mark the coupon as eliminated
            userData.coupons[couponIndex].status = 'eliminated';

            // Update user's data in Firestore
            await updateDoc(userDoc.ref, { coupons: userData.coupons });

            const response: DeleteCouponResponseDto = {
                statusCode: 200,
                message: 'COUPONELIMINATEDSUCCESSFULLY',
            };

            console.log(`The coupon has been marked as eliminated for user with email "${userEmail}" successfully.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }







    async getCoupons(): Promise<GetCouponsResponseDto> {
        try {
            console.log('Initializing getCoupons...');

            // Tries to use data in cache if it exists
            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            if (cachedCoupons.length > 0) {
                console.log('Using cached coupons data.');
                const getCouponsDtoResponse: GetCouponsResponseDto = {
                    statusCode: 200,
                    message: "COUPONSGOT",
                    couponsFound: cachedCoupons,
                };
                return getCouponsDtoResponse;
            }

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
                    code: data.code,
                    description: data.description,
                    discountType: data.discountType,
                    discountAmount: data.discountAmount,
                    expiryDate: data.expiryDate,
                    maxUses: data.maxUses,
                    maxUsesPerUser: data.maxUsesPerUser,
                    status: data.status,
                    currentUses: data.currentUses,
                    maxCurrentUses: data.maxCurrentUses,
                });
            });
            console.log('Coupons data collected.');

            // the data is saved in cache for future queries
            this.firebaseService.setCollectionData('coupons', queryResult);

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


    async redeemCoupon(redeemCouponDto: RedeemCouponDto): Promise<RedeemCouponResponseDto> {
        try {
            const { useremail, couponCode, resourceType, resourceTitle } = redeemCouponDto;


            // Fetch coupon data from Firestore
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', couponCode)));

            if (couponQuerySnapshot.empty) {
                throw new NotFoundException(`Coupon with code "${couponCode}" not found.`);
            }

            const couponData = couponQuerySnapshot.docs[0].data();

            // Fetch user data from Firestore based on email
            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(userCollectionRef, where('email', '==', useremail)));

            if (userQuerySnapshot.empty) {
                throw new NotFoundException(`User with email "${useremail}" not found.`);
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();

            // Check if the user has the coupon with the given code
            const couponInUserCoupons = userData.coupons.find(coupon => coupon.code === couponCode);
            if (!couponInUserCoupons) {
                throw new BadRequestException(`User does not have the coupon with code "${couponCode}".`);
            }

            if (couponInUserCoupons.status !== CouponStatus.Available) {
                throw new BadRequestException(`Coupon with code "${couponCode}" is not available.`);
            }

            // Fetch the specified resource based on resourceType and resourceTitle
            let resourcePrice = 0;
            if (resourceType === "Course") {
                const courseCollectionRef = collection(this.firebaseService.fireStore, 'courses');
                const courseQuerySnapshot = await getDocs(query(courseCollectionRef, where('title', '==', resourceTitle)));

                if (courseQuerySnapshot.empty) {
                    throw new NotFoundException(`Course with title "${resourceTitle}" not found.`);
                }

                const courseData = courseQuerySnapshot.docs[0].data();
                resourcePrice = courseData.price;
            } else if (resourceType === "Ebook") {
                const ebookCollectionRef = collection(this.firebaseService.fireStore, 'ebooks');
                const ebookQuerySnapshot = await getDocs(query(ebookCollectionRef, where('title', '==', resourceTitle)));

                if (ebookQuerySnapshot.empty) {
                    throw new NotFoundException(`Ebook with title "${resourceTitle}" not found.`);
                }

                const ebookData = ebookQuerySnapshot.docs[0].data();
                resourcePrice = ebookData.price;
            }

            // Calculate the final price based on coupon discount
            let finalPrice = resourcePrice;
            if (couponData.discountType === "nominal") {
                finalPrice -= couponData.discountAmount;
            } else if (couponData.discountType === "percentual") {
                const discountPercentage = couponData.discountAmount / 100;
                finalPrice -= finalPrice * discountPercentage;
            }


            // Update coupon status in the cache
            const indexToUpdate = userData.coupons.findIndex(coupon => coupon.code === couponCode);
            if (indexToUpdate !== -1) {
                userData.coupons[indexToUpdate].status = CouponStatus.Used;
                userData.coupons[indexToUpdate].currentUses++;
                userData.coupons[indexToUpdate].maxCurrentUses++;
            }

            

            console.log('Coupon successfully redeemed.');

            await updateDoc(couponQuerySnapshot.docs[0].ref, {
                currentUses: couponData.currentUses + 1,
                maxCurrentUses: couponData.maxCurrentUses + 1,
            });
            await updateDoc(userDoc.ref, { coupons: userData.coupons });

            

            const response: RedeemCouponResponseDto = new RedeemCouponResponseDto(201, "COUPON_REDEEMED_SUCCESSFULLY", finalPrice);
            return response;
        } catch (error) {
            console.error("An error occurred:", error);
            throw new Error("There was an error redeeming the coupon.");
        }
    }




    async assignCouponToUser(assignCouponDto: AssignCouponDto): Promise<AssignCouponResponseDto> {
        try {
            const { email, couponCode } = assignCouponDto;

            // Fetch coupon data from Firestore
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', couponCode)));

            if (couponQuerySnapshot.empty) {
                throw new NotFoundException(`Coupon with code "${couponCode}" not found.`);
            }

            const couponDoc = couponQuerySnapshot.docs[0];
            const couponData: Coupon = couponDoc.data() as Coupon;

            if (couponData.status !== CouponStatus.Available) {
                throw new BadRequestException(`Coupon with code "${couponCode}" is not available.`);
            }

            if (couponData.totalMaxUses === couponData.maxUses || couponData.currentUsesPerUser === couponData.maxUsesPerUser) {
                throw new BadRequestException(`Coupon with code "${couponCode}" has already reached its usage limits.`);
            }

            // Fetch user data from Firestore based on email
            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(userCollectionRef, where('email', '==', email)));

            if (userQuerySnapshot.empty) {
                throw new NotFoundException(`User with email "${email}" not found.`);
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();

            // Assign the coupon to the user and update the coupon's maxUsesPerUser attribute
            userData.coupons.push(couponData);

            await setDoc(userDoc.ref, userData);
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const updatedCachedUsers = cachedUsers.map(user => {
                if (user.email === email) {
                    return userData;
                }
                return user;
            });
            this.firebaseService.setCollectionData('users', updatedCachedUsers);

            // Update coupon cache
            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            const updatedCachedCoupons = [...cachedCoupons, couponData];
            this.firebaseService.setCollectionData('coupons', updatedCachedCoupons);

            const response: AssignCouponResponseDto = new AssignCouponResponseDto(201, "COUPON_ASSIGNED_SUCCESSFULLY");
            return response;
        } catch (error) {
            console.error("An error occurred:", error);
            throw new Error("There was an error assigning the coupon to the user.");
        }
    }



    async getCouponByCode(code: string): Promise<GetCouponsResponseDto> {
        try {
            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            const cachedCoupon = cachedCoupons.find(coupon => coupon.code === code);
            if (cachedCoupon) {
                console.log('Using cached coupon data.');
                const getCouponDtoResponse: GetCouponsResponseDto = {
                    statusCode: 200,
                    message: "COUPONSGOT",
                    couponsFound: [cachedCoupon],
                };
                return getCouponDtoResponse;
            }

            // If not found in cache, fetch from Firestore
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(query(couponCollectionRef, where('code', '==', code)));

            if (couponQuerySnapshot.empty) {
                throw new NotFoundException(`Coupon with code "${code}" not found.`);
            }

            const couponData = couponQuerySnapshot.docs[0].data();

            // Update cache with fetched coupon
            const updatedCachedCoupons = [...cachedCoupons, couponData];
            this.firebaseService.setCollectionData('coupons', updatedCachedCoupons);

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



    async filterCouponsByStatus(filterStatus: CouponStatus, userEmail: string): Promise<GetCouponsResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const userQuery = query(usersRef, where('email', '==', userEmail), limit(1));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                throw new NotFoundException(`User with email "${userEmail}" not found.`);
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




    async updateUserExpiredCouponsStatus(userEmail: string): Promise<SetCouponAsExpiredResponseDto> {
        try {
            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(userCollectionRef, where('email', '==', userEmail)));

            if (userQuerySnapshot.empty) {
                throw new NotFoundException(`User with email "${userEmail}" not found.`);
            }

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data() as User;

            const currentDate = new Date();
            const updatedUserCoupons: Coupon[] = [];

            for (const userCoupon of userData.coupons) {
                if (
                    userCoupon.status === CouponStatus.Available &&
                    userCoupon.expiryDate &&
                    this.isCouponExpired(userCoupon.expiryDate, currentDate)
                ) {
                    userCoupon.status = CouponStatus.Expired;
                }
                updatedUserCoupons.push(userCoupon);
            }

            await updateDoc(userDoc.ref, { coupons: updatedUserCoupons });

            console.log(`Updated user's (${userEmail}) expired coupons status.`);


            // Update cache for the user's coupons
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const userIndex = cachedUsers.findIndex((user) => user.email === userEmail);

            if (userIndex !== -1) {
                cachedUsers[userIndex].coupons = updatedUserCoupons;
                this.firebaseService.setCollectionData('users', cachedUsers);
            }


            const response: SetCouponAsExpiredResponseDto = new SetCouponAsExpiredResponseDto(200, "USER_COUPONS_UPDATED_SUCCESSFULLY");
            return response;

        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error updating user\'s expired coupons status.');
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



    async getCouponsByUser(userEmail: string): Promise<GetCouponsResponseDto> {
        try {
            const usersRef = this.firebaseService.usersCollection;
            const userQuery = query(usersRef, where('email', '==', userEmail), limit(1));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                throw new NotFoundException(`User with email "${userEmail}" not found.`);
            }

            const userData = userQuerySnapshot.docs[0].data();
            const userCoupons = userData.coupons || [];

            const getCouponsDtoResponse: GetCouponsResponseDto = {
                statusCode: 200,
                message: "COUPONSGOT",
                couponsFound: userCoupons,
            };

            return getCouponsDtoResponse;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error(`There was an error retrieving coupons for user "${userEmail}".`);
        }
    }



    async deleteExpiredAndUsedCouponsFromUser(userEmail: string): Promise<DeleteCouponResponseDto> {
        try {
            const userCollectionRef = collection(this.firebaseService.fireStore, 'users');
            const userQuerySnapshot = await getDocs(query(userCollectionRef, where('email', '==', userEmail)));

            if (userQuerySnapshot.empty) {
                console.log(`User with email "${userEmail}" not found.`);
                throw new NotFoundException('USERNOTFOUND');
            }
            const userDoc = userQuerySnapshot.docs[0];

            const userData = userDoc.data();
            let userCoupons = userData.coupons || [];

            // Filter coupons with status "expired" or "used"
            const couponsToDelete = userCoupons.filter(coupon => coupon.status === CouponStatus.Expired || coupon.status === CouponStatus.Used);

            // Delete filtered coupons from the user's collection
            for (const coupon of couponsToDelete) {
                const couponCode = coupon.code;
                userCoupons = userCoupons.filter(c => c.code !== couponCode);
            }

            // Update user's coupons in Firestore
            await updateDoc(userDoc.ref, { coupons: userCoupons });

            // Update the cache
            const cachedUsers = await this.firebaseService.getCollectionData('users');
            const userIndex = cachedUsers.findIndex((u) => u.email === userEmail);

            if (userIndex !== -1) {
                cachedUsers[userIndex].coupons = userCoupons;
                this.firebaseService.setCollectionData('users', cachedUsers);
            }

            const response: DeleteCouponResponseDto = {
                statusCode: 200,
                message: 'EXPIREDUSEDDELETEDSUCCESSFULLY',
            };

            console.log(`Expired and used coupons have been deleted successfully for user ${userEmail}.`);
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }


    async deleteExpiredCouponsFromFirebase(): Promise<DeleteCouponResponseDto> {
        try {
            // Fetch coupons from Firestore
            const couponCollectionRef = collection(this.firebaseService.fireStore, 'coupons');
            const couponQuerySnapshot = await getDocs(couponCollectionRef);

            // Filter coupons with status "expired"
            const expiredCouponRefs: DocumentReference[] = [];

            for (const couponDoc of couponQuerySnapshot.docs) {
                const couponData = couponDoc.data() as Coupon;

                if (couponData.status === CouponStatus.Expired) {
                    expiredCouponRefs.push(couponDoc.ref);
                }
            }

            // Delete expired coupons from Firestore
            const deletionPromises = expiredCouponRefs.map(async (couponRef) => {
                await deleteDoc(couponRef);
            });

            await Promise.all(deletionPromises);

            const cachedCoupons = await this.firebaseService.getCollectionData('coupons');
            const updatedCachedCoupons = cachedCoupons.filter((coupon) => coupon.status !== CouponStatus.Expired);
            this.firebaseService.setCollectionData('coupons', updatedCachedCoupons);


            const response: DeleteCouponResponseDto = {
                statusCode: 200,
                message: 'EXPIREDDELETEDSUCCESSFULLY',
            };

            console.log('Expired coupons have been deleted successfully.');
            return response;
        } catch (error: unknown) {
            console.warn(`[ERROR]: ${error}`);
            throw new InternalServerErrorException('INTERNALERROR');
        }
    }






   


}
