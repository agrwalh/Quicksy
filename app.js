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
const paymentRouter=require("./routes/payment")
const orderRouter=require("./routes/order")
const { categoryModel } = require('./models/category');

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

// Middleware to make categories available in all views
app.use(async (req, res, next) => {
    try {
        const categories = await categoryModel.find({});
        res.locals.categories = categories;
    } catch (err) {
        res.locals.categories = [];
    }
    next();
});

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/products", productRouter);
app.use("/categories",categoriesRouter);
app.use("/users",userRouter);
app.use("/cart",cartRouter);
app.use("/payment",paymentRouter);
app.use("/order",orderRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
