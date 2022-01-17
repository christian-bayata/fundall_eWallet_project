import express from 'express';
import passport from 'passport';
import userController from '../controllers/users';
import Auth from '../../middlewares/auth';
const router = express.Router();

router.route('/register').post(userController.signUp);

router.route('/login').post(userController.login);

router.route('/me').get(Auth.isAuthorized, userController.userProfile);

router.route('/logout').get(userController.logOut);

module.exports = router;