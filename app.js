// TODO: Search all todos

const express = require('express');
const session = require('express-session');
const process = require('process');
const passport = require('passport');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const MongoStore = require('connect-mongo');
require('./config/mongoose');
require('dotenv').config();
require('./config/passportLocal');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(path.join(__dirname, '/assets')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '/assets')));

app.use(session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    secure: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 * 7,   // 1 week
        autoRemove: 'native',
        crypto: {
            secret: process.env.CRYPTO_SECRET
        }
    })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use('/', require('./routes'));

app.listen(port);
