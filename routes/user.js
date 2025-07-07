const express = require('express');
const router = express.Router();
const { userModel, validateUser } = require('../models/user');
const passport = require('passport');
const transporter = require('../config/nodemailer');
const bcrypt = require('bcrypt');
const { categoryModel } = require('../models/category');
const { cartModel } = require('../models/cart');
const { productModel } = require('../models/product');

// In-memory OTP store (for demo; use DB in production)
const otpStore = {};

router.get("/login", async (req, res) => {
    const categories = await categoryModel.find({});
    res.render("user_login", { categories, cartCount: 0, user: req.user });
})

router.get("/profile",(req,res)=>{
res.send("profile page");
})

router.get("/logout",(req,res,next)=>{
  req.logout(function(err){
    if(err){
        return next(err)
    }
    req.session.destroy((err)=>{
        if(err){
            return next(err)
        }
       res.clearCookie("connect.sid");
    res.redirect("/users/login");
    })
  })
})

// GET address form (always after login)
router.get('/address', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/login');
  }
  const user = await userModel.findById(req.user._id);
  const categories = [];
  const cartCount = 0;
  res.render('address_form', { user, categories, cartCount });
});

// POST new address
router.post('/address', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/login');
  }
  const { address, city, state, zip } = req.body;
  if (!address || !city || !state || !zip) {
    return res.redirect('/users/address');
  }
  await userModel.findByIdAndUpdate(req.user._id, {
    $push: { addresses: { address, city, state, zip } }
  });
  req.session.selectedAddress = { address, city, state, zip };
  res.redirect('/');
});

// POST select saved address
router.post('/address/select', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/login');
  }
  const user = await userModel.findById(req.user._id);
  const idx = req.body.selectedAddress;
  if (user && user.addresses && user.addresses[idx]) {
    req.session.selectedAddress = user.addresses[idx];
  }
  res.redirect('/');
});

// POST login (local strategy)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, async (err) => {
      if (err) { return next(err); }
      // If add param is present, add product to cart
      const addProductId = req.body.add || req.query.add;
      if (addProductId) {
        let cart = await cartModel.findOne({ user: user._id });
        const product = await productModel.findById(addProductId);
        if (product) {
          if (!cart) {
            cart = await cartModel.create({
              user: user._id,
              products: [{ product: addProductId, quantity: 1 }],
              totalPrice: Number(product.price)
            });
          } else {
            const prodIndex = cart.products.findIndex(p => p.product.toString() === addProductId);
            if (prodIndex > -1) {
              cart.products[prodIndex].quantity += 1;
            } else {
              cart.products.push({ product: addProductId, quantity: 1 });
            }
            // Recalculate total price
            cart.totalPrice = 0;
            for (const item of cart.products) {
              const prod = await productModel.findById(item.product);
              cart.totalPrice += Number(prod.price) * item.quantity;
            }
            await cart.save();
          }
        }
        return res.redirect('/cart');
      }
      return res.redirect('/users/address');
    });
  })(req, res, next);
});

// GET forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('forgot_password', { categories: [], cartCount: 0 });
});

// POST send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.render('forgot_password', { categories: [], cartCount: 0, error: 'No user found with that email.' });
  }
  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore[email] = { otp, expires };
  // Send OTP email
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`
  });
  res.render('verify_otp', { email, categories: [], cartCount: 0 });
});

// GET verify OTP page (not used, POST only)
router.get('/verify-otp', (req, res) => {
  res.render('verify_otp', { email: '' });
});

// POST verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.render('verify_otp', { email, error: 'Invalid or expired OTP.', categories: [], cartCount: 0 });
  }
  // OTP valid, allow password reset
  res.render('reset_password', { email, categories: [], cartCount: 0 });
});

// GET reset password page (not used, POST only)
router.get('/reset-password', (req, res) => {
  res.render('reset_password', { email: '' });
});

// POST reset password
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.render('reset_password', { email, error: 'User not found.', categories: [], cartCount: 0 });
  }
  const hash = await bcrypt.hash(password, 10);
  user.password = hash;
  await user.save();
  // Clean up OTP
  delete otpStore[email];
  // Fetch categories for login page
  const categories = [];
  const cartCount = 0;
  res.render('user_login', { categories, cartCount, user: null, success: 'Password reset successful! Please log in.' });
});

module.exports = router;