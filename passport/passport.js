const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/post.model.js').User;
const LocalStrategy = require('passport-local').Strategy;

passport.use(
    new LocalStrategy({ usernameField: "username", passwordField: "password" }, async(username, password, done) => {
        try {
            console.log(username);
            console.log(password);
            const user = await User.findOne({ username });

            if (!user) {
                return done(null, false, { message: "Incorrect Username" });

            }
            if (user.password != password) {
                return done(null, false, { message: "Incorrect Password" });
            }
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user.id)
});


passport.deserializeUser(async(id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false)
    }

});