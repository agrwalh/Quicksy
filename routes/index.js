const express = require('express');
const router = express.Router();
const { productModel } = require('../models/product');
const { cartModel } = require('../models/cart');

router.get('/', async function (req, res) {
    try {
        const rnproducts = await productModel.find({});
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
        if (req.user) {
            const cart = await cartModel.findOne({ user: req.user._id });
            if (cart && cart.products.length > 0) {
                somethingInCart = true;
                cartCount = cart.products.length;
            }
        }
        res.render("index", { rnproducts, products, somethingInCart, cartCount });
    } catch (err) {
        res.status(500).send('Error fetching products');
    }
});

module.exports = router;