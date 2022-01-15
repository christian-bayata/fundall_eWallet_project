import db from '../models/index';
import status from 'http-status';
import ErrorHandler from '../utils/errorHandler';
import jwt from 'jsonwebtoken';
import { secretKey, jwtExpirationTime } from '../settings';

const User = db.User;

const Auth = {
  /**
  * Checks for user authentication
  * @param {Object} req 
  * @param {Object} res
  * @param {Object} next
  * @returns {Boolean} true or false
  */

   getToken(user) {
        const token = jwt.sign({
            userId: user.id,
            userEmail: user.email
        },
        secretKey, { expiresIn: jwtExpirationTime }
        );
        return token;
    },
  
    /**
   * verify user web token
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - move to next controller handler
   * @returns {void} no returns
   */ 
    async verifyToken(req, res, next){
        const token = req.header("x-auth-token");
        if(!token) {
            return next(new ErrorHandler("please provide a valid token", status.UNAUTHORIZED));
        } 
        
        try {
            const decoded = jwt.verify(token, secretKey);
            
            const verifiedUser = await User.findById(decoded.userId);
            if(!verifiedUser) {
                return next(new ErrorHandler("Account not found. Please sign-in or sign-up to get acesss", status.NOT_FOUND));
            }
            req.user = decoded;
            next()
        } 
        catch(err) {
            return next(new ErrorHandler("Sign-in or Sign-up to get a token", status.BAD_REQUEST));
        }
    },

    /**
   * Verifies user access to a protected route
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @param {Object} next - move to next controller handler
   * @returns {void} no returns
   */
    isUserAuthenticated(req, res, next) {
        if(req.isAuthenticated()) {
            next();
        } else {
            next(new ErrorHandler("You are unauthorized to access this resource", status.UNAUTHORIZED))
        }
    },

    destroySession(req, res, next) {
        req.logOut();
        req.session.destroy();
        res.redirect('/login');
    }


};

export default Auth;