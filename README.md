# FUNDALL_EWALLET_PROJECT

> A Secure mini API that mocks the flows of a virtual e-Wallet for virtual cards. The API was built using several npm packages, more specifically:

- Express - a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- Passport - a simple, unobtrusive authentication for Node.js
- Sequelize - a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.
- Joi - a popular module for data validation.
- Morgan - HTTP request logger middleware for node.js.
- MYSQL2 - a project is a continuation of MySQL-Native.

- :cop: Authentication via [JWT](https://jwt.io/)
- Routes mapping via [express-router](https://expressjs.com/en/guide/routing.html)
- All background operations run on [fundall_ewallet_background_service](https://github.com/christian-bayata/fundall_eWallet_project.git).
- Uses [MySQL2](https://www.mysql.com/) as database.
- Uses [Sequelize](https://sequelize.org/) as object relation model
- Environments for `development` and `testing`
- Linting via [eslint](https://github.com/eslint/eslint)
- Transpiling from ES6 to plain old ES5 using [babel](babeljs.io)
- Text formatting via [prettier](prettier.io)
- Integration tests running with [Jest](https://github.com/facebook/jest)
- Built with [npm scripts](#npm-scripts)
- example for User model and User controller, with jwt and passport authentication, simply type `npm run dev`

## Table of Contents

- [Controllers](#controllers)
  - [Create a Controller](#create-a-controller)
- [Models](#models)
  - [Create a Model](#create-a-model)
- [Middlewares](#middlewares)
  - [auth.js](#authmiddleware)
- [Config](#config)
  - [Connection and Database](#connection-and-database)
- [Routes](#routes)
  - [Create Routes](#create-routes)
- [Test](#test)
  - [Setup](#setup)
- [npm Scripts](#npm-scripts)

## _Controllers_

### _Create a Controller_

> The user controller was designed to be an object with 4 methods,namely: `signUp()`, `login()`, `userProfile()`, `logOut()`;

```js
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
    if (error)
      return res.status(status.BAD_REQUEST).send(error.details[0].message);

    let { firstName, lastName, email, password, phoneNum } = req.body;

    const emailExists = await db.User.findOne({ where: { email } });
    if (emailExists)
      return next(
        new ErrorHandler(
          'User with this email already exists',
          status.BAD_REQUEST
        )
      );

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
    if (error)
      return res.status(status.BAD_REQUEST).send(error.details[0].message);

    let { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user)
      return next(
        new ErrorHandler('Email address does not exist', status.NOT_FOUND)
      );

    const confirmPassword = await user.validPassword(password);
    if (!confirmPassword)
      return next(
        new ErrorHandler('Password does not match', status.NOT_FOUND)
      );

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
    const user = await db.User.findByPk(req.user.userId);
    return res.status(status.CREATED).send({
      message: `Welcome ${user.firstName}`,
      user,
    });
  },

  async logOut(req, res, next) {
    res.header = null;
    res.status(status.OK).send({
      message: 'Successfully logged out',
    });
  },
};

export default userController;
```

## _Models_

### _Create a Model_

Models in this boilerplate use [Sequelize](https://sequelize.org/) as the Object relation Model.

Example User Model:

```js
import bcrypt from 'bcrypt-nodejs';
import { saltFactor } from '../settings';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phoneNum: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      classMethods: {
        generateHash: function (password) {
          return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        },
      },
    },
    {
      hooks: {
        beforeUpdate: async (user) => {
          const salt = await bcrypt.genSaltSync(10, 'a');
          user.password = bcrypt.hashSync(user.password, salt);
        },
      },
    }
  );

  User.beforeCreate(async (user, options) => {
    if (user.password) {
      const salt = await bcrypt.genSaltSync(10, 'a');
      user.password = bcrypt.hashSync(user.password, salt);
    }
  });

  User.prototype.validPassword = function (password) {
    console.log('password', password, 'this.password', this.password);
    return bcrypt.compareSync(password, this.password);
  };
  return User;
};
```

## _Middlewares_

Middleware are functions that can run before hitting a route.

Example middleware:

Only allow if the user is logged in

> Note: this is not a secure example, only for presentation purposes

```js
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
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      secretKey,
      { expiresIn: expiresIn }
    );
    return token;
  },

  async verifyToken(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
      return next(
        new ErrorHandler(
          'You cannot access this resource, please provide a valid token',
          status.UNAUTHORIZED
        )
      );
    }
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      console.log(req.user);
      next();
    } catch (err) {
      return next(new ErrorHandler('Invalid token', status.BAD_REQUEST));
    }
  },
};

export default Auth;
```

Another middleware function handles the error. Here is an example:

```js
import status from 'http-status';

/**
 * Error handler that serves as a middleware for the API
 * @param {Object} err - error object
 * @param {Object} res - response object
 * @returns {object} error object
 */

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR;

  res.status(err.statusCode).json({
    success: false,
    error: err,
    errMessage: err.message,
    stack: err.stack,
  });
};

export default errorMiddleware;
```

## _config_

### _connection-and-database_

A pre-installed config file comes from `sequelize init`, which gves direction to the `env` variables: `development`, `test`, `production`

### _config.js_

```js
{
  "development": {
    "username": "root",
    "password": "",
    "database": "ewalletdb",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "port": "4306"
  },
  "test": {
    "username": "root",
    "password": "",
    "database": "ewalletdb_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": "",
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

The `index.js` database config is a default configuration file for our database that structure the models and schema:

### _index.js_

```js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const db = {};

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable])
  : new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

## _Routes_

Here you define all your routes for your api.

## _Create Routes_

For further information read the [guide](https://expressjs.com/en/guide/routing.html) of express router.

Example for User Resource:

> Note: The only implemented methods used for this project are **POST** and **GET**.

```js
import express from 'express';
import passport from 'passport';
import userController from '../controllers/users';
import Auth from '../../middlewares/auth';
const router = express.Router();

router.route('/register').post(userController.signUp);

router.route('/login').post(userController.login);

router.route('/me').get(Auth.verifyToken, userController.userProfile);

router.route('/logout').get(userController.logOut);

module.exports = router;
```

## Tests

All test for this boilerplate uses [Jest](https://github.com/facebook/jest) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So please read their docs on further information.

### _Controller_

> Note: those request are asynchronous, we use `async await` syntax.

> Note: For ES6 based test, we use `import` and not the `require` syntax for tests

> All controller actions are wrapped in a function to avoid repetitive try...catch syntax

To test a Controller we create `requests` to our api routes.

```js
import request from 'supertest';
import server from '../../app';
import db from '../../models/index';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { secretKey } from '../../settings';

const baseURI = '/api/v1';
let app;

describe('Users Controller', () => {
  beforeAll(async () => {
    app = server;
    await db.User.truncate({ cascade: true });
  }, 10000);

  afterAll(async () => {
    app.close();
    await db.User.truncate({ cascade: true });
    await db.sequelize.close();
  });

  describe('Register User', () => {
    let payload;
    const exec = async () => {
      return await request(app).post(`${baseURI}/register`).send(payload);
    };

    beforeEach(() => {
      payload = {
        firstName: 'Frank',
        lastName: 'Osagie',
        email: 'franksagie1@gmail.com',
        password: 'frank123',
        phoneNum: '08000000000',
      };
    });

    it('should return 400 if user firstName is missing from payload', async () => {
      payload.firstName = '';
      const response = await exec();
      expect(response.status).toBe(400);
    });
    it('should return 400 if user lastName is missing from payload', async () => {
      payload.lastName = '';
      const response = await exec();
      expect(response.status).toBe(400);
    });
    it('should return 400 if email is missing from payload', async () => {
      payload.email = '';
      const response = await exec();
      expect(response.status).toBe(400);
    });
    it('should return 400 if password is missing from payload', async () => {
      payload.password = '';
      const response = await exec();
      expect(response.status).toBe(400);
    });
    it('should return 400 if phone number is missing from payload', async () => {
      payload.phoneNum = '';
      const response = await exec();
      expect(response.status).toBe(400);
    });
    it('should return 400 if a user email already exists', async () => {
      await db.User.bulkCreate({
        firstName: 'user_firstName',
        lastName: 'user_lastName',
        email: 'user@gmail.com',
        password: 'abc123',
        phoneNum: '08000000000',
      });
      const response = await exec();
      try {
        expect(response.status).toEqual(400);
      } catch (err) {
        console.log('Error, ', err);
      }
    });
    it('should return 201 if the user supplies a valid payload', async () => {
      let response;
      try {
        response = await exec();
        expect(response.status).toBe(201);
      } catch (err) {
        console.log('Error:', err);
      }
    });
  });

  describe('Login Users', () => {
    let payload;
    const exec = async () => {
      return await request(app).post(`${baseURI}/login`).send(payload);
    };
    beforeEach(() => {
      payload = {
        email: 'franksagie1@gmail.com',
        password: 'frank123',
      };
    });

    it('should return 400 if user does not supply email to the payload', async () => {
      payload.email = '';
      const response = await exec();
      expect(response.status).toEqual(400);
    });
    it('should return 400 if user does not supply password to the payload', async () => {
      payload.password = '';
      const response = await exec();
      expect(response.status).toBe(400);
    });
    it('should return 400 if user email is not found in the database', async () => {
      const response = await exec();
      try {
        expect(response.status).toBe(400);
      } catch (err) {
        console.log(err);
      }
    });
    it('should return 400 if email already exists in the database', async () => {
      await db.User.bulkCreate({
        firstName: 'Frank',
        lastName: 'Osagie',
        email: 'franksagie1@gmail.com',
        password: 'frank123',
        phoneNum: '08000000000',
      });
      const response = await exec();
      try {
        expect(response.status).toBe(400);
      } catch (err) {
        console.log(err);
      }
    });

    it('should generate token for logged in users', async () => {
      const token = jwt.sign({ userid: '1', email: payload.email }, secretKey);

      const response = await exec();
      expect(response.body.token).not.toBeNull();
      expect(response.header).toBeDefined();
    });
    it('should return 200 if user payload has correct details', async () => {
      try {
        expect(response.status).toBe(200);
        expect(response.body.message).toMatch(/signed up/);
        expect(response.header).toBeDefined();
      } catch (err) {
        console.log('Error: ', err);
      }
    });
  });

  describe('Get logged-in user details', () => {
    it('should return 200 if the  user details are found', async () => {
      const token = jwt.sign(
        {
          userId: '1',
          email: 'frankie1@gmail.com',
        },
        secretKey
      );
      const decoded = jwt.verify(token, secretKey);
      const response = await request(app)
        .get(`${baseURI}/me`)
        .set('x-auth-token', token);
      try {
        expect(response.status).toEqual(200);
        expect(decoded.id).toBeTruthy();
      } catch (err) {
        console.log('Error: ', err);
      }
    });
  });

  describe('Log out a user', () => {
    it('should return 200 if user is logged out', async () => {
      const res = await request(app)
        .get(`${baseURI}/logout`)
        .set('x-auth-token', null);
      expect(res.status).toEqual(200);
      expect(res.body.message).toMatch(/logged out/i);
    });
  });
});
```
