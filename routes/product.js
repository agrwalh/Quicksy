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
    if (req.user && req.user._id) {
        const { cartModel } = require('../models/cart');
        const cart = await cartModel.findOne({ user: req.user._id });
        if (cart && cart.products && cart.products.length > 0) {
            somethingInCart = true;
            cartCount = cart.products.length;
        }
    }
    // Fetch all categories for the navbar/footer
    const categories = await categoryModel.find({});
    res.render("index", { rnproducts, products, somethingInCart, cartCount, categories, user: req.user });
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
router.get('/:id', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        const categories = await categoryModel.find({});
        let cartCount = 0;
        if (req.user && req.user._id) {
            const cart = await cartModel.findOne({ user: req.user._id });
            if (cart && cart.products && cart.products.length > 0) {
                cartCount = cart.products.length;
            }
        }
        res.render('product_detail', { product, categories, cartCount, user: req.user });
    } catch (err) {
        res.status(500).send('Error loading product: ' + err.message);
    }
});





router.post("/", upload.array("images"), async (req, res) => {
 let { name, price, category, stock, description } = req.body;
 let { error } = validateProduct({
    name,
    price,
    category,
    stock,
    description,
 });
 if (error) return res.send(error.message);

 let isCategory = await categoryModel.findOne({ name: category });
 if (!isCategory) {
    await categoryModel.create({ name: category });
 }

 let images = [];
 if (req.files && req.files.length > 0) {
    images = req.files.map(file => file.buffer);
 }

 // For backward compatibility, set image to first image if exists
 let image = images.length > 0 ? images[0] : undefined;

 await productModel.create({
    name,
    price,
    category,
    images,
    image,
    description,
    stock,
 });

 res.redirect(`/admin/dashboard`);
});




module.exports = router;