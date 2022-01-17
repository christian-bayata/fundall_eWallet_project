import 'express-async-errors';
import db from '../../models/index';
import status from 'http-status';
import ErrorHandler from '../../utils/errorHandler';
import validateUserSignUp from '../../input_validation/validate_user_signup';
import validateUserLogin from '../../input_validation/validate_user_login';
import Auth from '../../middlewares/auth';
import _ from 'lodash';

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
    if (error) return res.status(status.BAD_REQUEST).send(error.details[0].message);

    let { firstName, lastName, email, password, phoneNum } = req.body;

    const emailExists = await db.User.findOne({ where: { email }});
    if(emailExists) return next(new ErrorHandler("User with this email already exists", status.BAD_REQUEST));

    const user = await db.User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNum,
    });

    const token = Auth.getToken(user);

    let result = _.pick(user, ['firstName', 'lastName', 'email', 'phoneNum']);
    result.token = token;
    res.header('x-auth-token', token);
    return res.status(status.CREATED).send({
      message: 'New user successfully signed up',
      result,
    });
  },

  
/**
 * @Responsibilty - Logs in a User
 * @param req
 * @param res
 * @param next
 * @route - /api/v1/register
 * @returns {Object}
 */

  async login(req, res, next) {
    const { error } = await validateUserLogin(req.body);
    if (error) return res.status(status.BAD_REQUEST).send(error.details[0].message);

    let { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user) return next(new ErrorHandler('Email address does not exist', status.NOT_FOUND));

    const confirmPassword = await user.validPassword(password);
    if (!confirmPassword) return next(new ErrorHandler('Password does not match', status.NOT_FOUND));

    const token = Auth.getToken(user);
    let result = _.pick(user, ['id', 'firstName', 'lastName', 'email']);
    result.token = token;
    res.header('x-auth-token', token);
    return res.status(status.CREATED).send({
      message: 'Log in successful',
      result,
    });
  },

    /**
     * @Responsibilty - get user details
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/me
     * @returns {Object} 
     */
    async userProfile(req, res, next) {
        // const user = await db.User.findByPk(req.user.userId);     
        // return res.status(status.CREATED).send({
        //     message: `Welcome ${user.firstName}`,
        //     user
        // });
        res.send('Buy me now');
    }, 

    async logOut(req, res, next) {
        res.header = null;
        res.status(status.OK).send({
            message: "Successfully logged out"
        })
    }
};

export default userController;