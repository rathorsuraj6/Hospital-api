const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const Doctor = require('../models/doctor_model');

let opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET
}

passport.use(new JWTStrategy(opts, function(jwtPayload,done){

    Doctor.findById(jwtPayload._id, function(err, user){

        if(err){
            console.log('Error in finding doctor using JWT ',err);
            return;
        }

        if(user){
            return done(null,user);
        }else{
            return done(null,false);
        }
    })
    
}));

module.exports = passport;