passport = require('passport');
const LS = require('passport-local').Strategy;
const Users = require('../models/Users');
const {isValid} = require("./pass");


module.exports = {
    local(passport) {
        passport.use(new LS({usernameField: 'email'}, async (username, password, done) => {
                try {
                    const user = await Users.findOne({email: username});
                    if (!user) {
                        return done(null, false, {message: "User not found"});
                    }
                    if (!(isValid(password, user.password.salt, user.password.hash))) {
                        return done(null, false, {message: "Invalid Password"})
                    }
                    return done(null, user)
                } catch (err) {
                    return done(err)
                }

            }
        ))
        passport.serializeUser((user, done) => {
            done(null, user._id)
        })
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await Users.findById(id)
                return done (null, user)
            } catch (e) {
                done(e)
            }
        })
    },
};

