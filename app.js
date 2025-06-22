const express = require('express');
const app = express();
const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const expressSession = require('express-session'); // Correct variable
const path = require('path');
const passport = require('passport');

require('dotenv').config();
require('./config/db');
require('./config/google_oauth_config');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/auth", authRouter);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
