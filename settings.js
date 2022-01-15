import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 5000;
export const environment = process.env.NODE_ENV || "development";

export const secretKey = process.env.JWTPRIVATEKEY;
export const jwtExpirationTime = process.env.JWTEXPIRATIONTIME;
export const sessionSecret = process.env.SESSIONSECRETKEY;
export const saltFactor = process.env.SALT_FACTOR;