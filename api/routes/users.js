import express from 'express';
import passport from 'passport';
import userController from '../controllers/users';
const router = express.Router();

router.route('/register').post(userController.signUp);

router.route('/login').post(userController.login);

module.exports = router;