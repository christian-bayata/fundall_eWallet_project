import 'express-async-errors';
import express from 'express';
import { port, environment } from './settings';
import user from './api/routes/users';
import errorMiddleware from './middlewares/error';
import passport from 'passport';
import logger from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
require('./config/passport_config');

const app = express();

//Init Express Set-up
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(cookieParser());
app.set('trust-proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());


//Error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down due to uncaught exception');
});

//Routes
app.use('/api/v1', user);

//Error Handler Middleware
app.use(errorMiddleware);

app.listen(port, () => console.log(`server running on port ${port} in ${environment} mode`))

//Error handler for unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down due to unhandled rejections');
    server.close(() => {
        process.exit(1)
    }) 
});