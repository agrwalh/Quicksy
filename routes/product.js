const express = require('express');
const router = express.Router();
const { productModel, validateProduct }= require('../models/product');
const upload =require("../config/multer_config");
const { categoryModel ,validateCategory} = require('../models/category');
const { validateAdmin,userIsLoggedIn } = require('../middlewares/admin');
const { cartModel } = require('../models/cart');

router.get('/', async (req, res) => {
    let rnproducts = await productModel.find();
    // Group products by category
    const products = {};
    rnproducts.forEach(product => {
        if (!products[product.category]) {
            products[product.category] = [];
        }
        products[product.category].push(product);
    });
    let somethingInCart = false;
    let cartCount = 0;
    // If you have user authentication and cart logic, you can check for cart items here
    if (req.user && req.user._id) {
        const { cartModel } = require('../models/cart');
        const cart = await cartModel.findOne({ user: req.user._id });
        if (cart && cart.products && cart.products.length > 0) {
            somethingInCart = true;
            cartCount = cart.products.length;
        }
    }
    res.render("index", { rnproducts, products, somethingInCart, cartCount });
});
router.get('/delete/:id', async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        res.status(500).send('Error deleting product: ' + err.message);
    }
});
router.post('/delete',validateAdmin, async (req, res) => {
    console.log('req.user:', req.user);
    if(req.user && req.user.admin){
        let prods=await productModel.findOneAndDelete({
            _id: req.body.product_id,
        })
        return res.redirect("/admin/dashboard");
    }
    res.status(403).send("You are not allowed to delete this product. Admin check failed. Please re-login as admin.");
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