import { doubleCsrf } from "csrf-csrf";
import * as dotenv from 'dotenv';
dotenv.config();


//For Hashing
export const saltOrRoundsNumber: number = Number(process.env.SALT_ROUNDS);



//Used in CSRF
export const csrfSecret: string = process.env.CSRF_SECRET;



//Used in CSRF Middleware
export const csrfCookieName: string = process.env.CSRF_COOKIE_NAME;
export const csrfParamName: string = process.env.CSRF_PARAM_NAME;

//Used in JWT

//Secret for the JWT Token
export const jwtSecret = process.env.JWT_SECRET;
//Expiration time for the JWT Token
export const jwtTime = process.env.JWT_TIME;
//Secret for the cookie that contains the JWT Token
export const jwtCookieSecret = process.env.JWT_COOKIE_SECRET;
//Secret for the refresh token
export const refreshSecret = process.env.REFRESH_SECRET;
//Expiration time for the Refresh Token
export const refreshTime = process.env.REFRESH_TIME;
//convert minutes to seconds
export const timeMultiplier = Number(process.env.TIME_MULTIPLIER);

//Used for auth

export const cookieTimeMultiplier = Number(process.env.COOKIE_TIME_MULTIPLIER);
export const freezeTime = Number(process.env.FREEZE_TIME);
export const freezeLimit = Number(process.env.FREEZE_LIMIT);
export const otpAppName: string = process.env.OTP_APP_NAME;


export const stage: string = process.env.STAGE;


//Throttler Module
export const timeToLive: number = Number(process.env.TIME_TO_LIVE);
export const throttlerLimit: number = Number(process.env.LIMIT);


export const cookieAge: number = Number(process.env.COOKIE_AGE);
export const cookieSecret: string = process.env.COOKIE_SECRET;









export const {generateToken, validateRequest, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => csrfSecret,
    cookieName: csrfCookieName,
    cookieOptions: {
        sameSite: "lax",
        path: "/",
        secure: true
    },
    size: 64,
    getTokenFromRequest: (req) => req.params.csrfCookieName,
});
