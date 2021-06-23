const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');
const bcrypt = require('bcrypt');

// authentication using passport
passport.use(new LocalStrategy({
    usernameField: 'user_id',
    passwordField: 'password'
}, async function (username, password, done) {
    await User.findOne({ username: username }, async function (err, user) {
        if (err)
            return done(err);
        if (!user)
            return done(null, false);
        const hasCheckResult = await bcrypt.compare(password, user.password);
        if (!hasCheckResult)
            return done(null, false);
        return done(null, user);
    });
}
));

// serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        if (err)
            return done(err);
        done(err, user);
    });
});

// check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    else
        return res.status(401).redirect('/auth/signin');
}

passport.setAuthenticatedUser = async function (req, res, next) {
    if (await req.isAuthenticated())
        res.locals.user = req.user;
    next();
}

module.exports = passport;
