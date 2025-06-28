const express = require('express');
const app = express();
const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const expressSession = require('express-session'); // Correct variable
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const productRouter = require('./routes/product');
const categoriesRouter = require('./routes/category');
const userRouter=require("./routes/user")
const cartRouter=require("./routes/cart")

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
       
    })
);
app.use(cookieParser())

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/products", productRouter);
app.use("/categories",categoriesRouter);
app.use("/users",userRouter);
app.use("/cart",cartRouter);


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
