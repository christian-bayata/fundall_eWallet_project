import db from '../models/index';
import status from 'http-status';
import ErrorHandler from '../utils/errorHandler';
import jwt from 'jsonwebtoken';
import { secretKey } from '../settings';
import passport from 'passport';

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
            email: user.email
        },
        secretKey, { expiresIn: '7d' }
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

    isAuthorized(req, res, next) {
        passport.authenticate('jwt', { session: false }, async (err, token) => {
            if(err || token) {
                res.status(401).json({ message: "Unauthorized user"});
            } 
            try {
                const user = await db.User.findOne({ id: token.userId });
                req.user = user;
            } catch(err) {
                next(err);
            }
        })(req, res, next)
    }
//     async verifyToken(req, res, next){
//         var token = req.headers.authorization.split(' ')[1];
//         if(!token) {
//             return next(new ErrorHandler("please provide a valid token", status.UNAUTHORIZED));
//         } 
        
//         try {
//             const decoded = jwt.verify(token, secretKey);
//             req.user = decoded;
//             next()
//         } 
//         catch(err) {
//             console.log(err)
//             return next(new ErrorHandler("Sign-in or Sign-up to get a token", status.BAD_REQUEST));
//         }
//     }
};

export default Auth;