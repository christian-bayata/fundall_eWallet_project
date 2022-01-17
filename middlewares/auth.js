import jwt from 'jsonwebtoken';
import { secretKey } from '../settings';
import status from 'http-status';
import ErrorHandler from '../utils/errorHandler';

const Auth = {
  /**
  * Checks for user authentication
  * @param {Object} req 
  * @param {Object} res
  * @param {Object} next
  * @returns {Boolean} true or false
  */

   getToken(user) {
       const expiresIn = '7d';
       const token = jwt.sign({
            userId: user.id,
            email: user.email,
        }, secretKey, { expiresIn: expiresIn });
        return token;
    },

    async verifyToken(req, res, next) {
    const token = req.header("x-auth-token"); 
    if(!token) {
        return next(new ErrorHandler("You cannot access this resource, please provide a valid token", status.UNAUTHORIZED));   
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        console.log(req.user);
        next();
    } 
    catch(err) {
        return next(new ErrorHandler("Invalid token", status.BAD_REQUEST));
    }
  }
}

export default Auth;