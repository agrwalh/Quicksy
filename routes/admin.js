const express = require('express');
const router = express.Router();
const { adminModel } = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateAdmin } = require('../middlewares/admin');
const { productModel } = require('../models/product');
const { categoryModel } = require('../models/category');

require('dotenv').config();

// Correct the condition to check if it's DEVELOPMENT mode
if (process.env.NODE_ENV === 'DEVELOPMENT') {
  router.get('/create', async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("admin", salt);

      const user = new adminModel({
        name: "HARSH",
        email: "harsh@gmail.com",
        password: hash,
        role: "admin", // fixed: "admin" should be a string, not a variable
      });

      await user.save();

      const token = jwt.sign({ email: "harsh@gmail.com",admin:true }, process.env.JWT_KEY);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PRODUCTION", // Secure cookie in production
        sameSite: "strict",
      });

      res.send("ADMIN CREATED");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating admin: " + err.message);
    }
  });
}
router.get("/login",(req,res)=>{
    res.render("admin_login")
})
router.post("/login",async(req,res)=>{
   let {email,password}=req.body;
   let admin=await adminModel.findOne({email})
   if(!admin) return res.send("This admin is not available");

   let valid=await bcrypt.compare(password,admin.password)
   if(valid){
    let token=jwt.sign({email:"harsh@gmail.com",admin:true},process.env.JWT_KEY);
    res.cookie("token",token)
    res.redirect("/admin/dashboard")
   }
})
router.get("/dashboard",validateAdmin,async(req,res)=>{
    const prodcount = await productModel.countDocuments();
    const categcount = await categoryModel.countDocuments();
    res.render("admin_dashboard", { prodcount, categcount });
})
router.get("/products",validateAdmin,async(req,res)=>{
  const result = await productModel.aggregate([
  {
    $sort: { _id: 1 }
  },
  {
    $group: {
      _id: "$category",
      products: { $push: "$$ROOT" }
    }
  },
  {
    $project: {
      _id: 0,
      k: "$_id",
      v: { $slice: ["$products", 10] }
    }
  },
  {
    $group: {
      _id: null,
      asArray: {
        $push: {
          k: "$k",
          v: "$v"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      categories: { $arrayToObject: "$asArray" }
    }
  }
]);


  
  let productsRaw = await productModel.find();
  // Group products by category
  let products = {};
  productsRaw.forEach(product => {
    if (!products[product.category]) {
      products[product.category] = [];
    }
    products[product.category].push(product);
  });
  res.render("admin_products", { products });
})

router.get("/logout",validateAdmin,function(req,res){
  res.cookie("token","");
  res.redirect("/admin/login")
})
module.exports = router;
