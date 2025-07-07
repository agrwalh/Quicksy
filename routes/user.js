const express = require('express');
const router = express.Router();
const { userModel, validateUser } = require('../models/user');
const passport = require('passport');

router.get("/login",(req,res)=>{
    res.render("user_login")
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
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect('/users/address');
    });
  })(req, res, next);
});

module.exports = router;