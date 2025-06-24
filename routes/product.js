const express = require('express');
const router = express.Router();
const { productModel, validateProduct }= require('../models/product');
const upload =require("../config/multer_config");
const { categoryModel ,validateCategory} = require('../models/category');

router.get('/', async (req, res) => {
    let prods=await productModel.find();
    res.send(prods);
});
router.post("/", upload.single("image"), async (req, res) => {
    
 let { name,price,category,stock,description,image }=req.body;
 let {error}=validateProduct({
    name,
    price,
    category,
    stock,
    description,
    image,
})
if (error) return res.send(error.message);

let isCategory=await categoryModel.findOne({name:category});
if(!isCategory){
    await categoryModel.create({name:category})
}

await productModel.create({
    name,
    price,
    category,
    image:req.file.buffer,
    description,
    stock,
});

res.redirect(`/admin/dashboard`)
})




module.exports = router;