import 'express-async-errors';
import db from '../../models/index';
import status from 'http-status';
import ErrorHandler from '../../utils/errorHandler';
import validateUserSignUp from '../../input_validation/validate_user_signup';
import validateUserLogin from '../../input_validation/validate_user_login';
import Auth from '../../middlewares/auth';
import _ from 'lodash';
import Helper from '../../helpers/helper';
const User = db.User;

/**
     * @Author - "Edomaruse, Frank"
     * @Responsibilty - Creates a new User via sign-up
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/register
     * @returns {Object} 
*/

const userController = {
    async signUp(req, res, next) {

        const { error } = await validateUserSignUp(req.body);
        if(error) return res.status(status.BAD_REQUEST).send(error.details[0].message);

        let { firstName, lastName, email, password, phoneNum } = req.body;

        // const existingUser = await UserRepository.findUsingEmail(email);
        // if(existingUser) {
        //     return Response.badRequest({ res, message: "User already exists" });
        // }

        const user = await db.User.create({
            firstName,
            lastName,
            email,
            password,
            phoneNum
        });
            
        const token = Auth.getToken(user);
        
        let result = _.pick(user, [ "firstName", "lastName", "email", "phoneNum" ]);
        result.token = token;
        res.header('x-auth-token', token);
        return res.status(status.CREATED).send({
            message: "New user successfully signed up",
            result
        }) 
    },

    async login(req, res, next) {
        const { error } = await validateUserLogin(req.body);
        if(error) return res.status(status.BAD_REQUEST).send(error.details[0].message);

        // let { email, password } = req.body;
        const user = await db.User.findOne({where: {email: req.body.email, password: req.body.password} });
        if(!user) return next(new ErrorHandler("Email address does not exist", status.NOT_FOUND ));

        const confirmPassword = await user.validPassword(req.body.password);
        if(!confirmPassword) return next(new ErrorHandler("Password does not match", status.NOT_FOUND ));

        const token = user.getToken(user);
        let result = _.pick(user, ["id", "firstName", "lastName", "email"]);
        result.token = token;
        res.header('x-auth-token', token);
        return res.status(status.CREATED).send({
            message: 'Log in successful',
            result

        }); 
    }
}


export default userController;

    // login(req, res, next) {
    //     let {email, password} = req.body;
    //     User
    //       .findOne({ where: {email:email} })
    //       .then((user) => {
    //         if (user && user.validPassword(password)) {
    //           const token = Auth.getToken(user);
    //         //   user = Helper.getUserProfile(user);
            
    //         let result = _.pick(user, ["id", "firstName", "email"]);
    //         result.token = token;
    //         res.header('x-auth-token', token);
    //           return res.status(status.OK)
    //             .json({
    //               message: 'You have successfully logged in',
    //               token,
    //               user
    //             });
    //         }
    //         res.status(401)
    //           .send({
    //             message: 'Please enter a valid email or password to log in'
    //           });
    //       }).catch(err => (res.status(400)
    //         .send(err)));
    //   },