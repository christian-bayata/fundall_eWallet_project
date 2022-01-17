import passport from 'passport';
import db from '../models/index';
import { secretKey } from '../settings';

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretKey
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    db.User.findOne({where: {id: jwt_payload.userId}}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            console.log(done(null, user));
        } else {
            return done(null, false);
        }
    });
}));