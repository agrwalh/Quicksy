const express = require('express');
const router = express.Router();
const { productModel } = require('../models/product');
const { cartModel } = require('../models/cart');
const { categoryModel } = require('../models/category');
const { orderModel } = require('../models/order');
const { deliveryModel } = require('../models/delivery');

router.get('/', async function (req, res) {
    try {
        // Always fetch all products, ignore category filter
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
        let cart = [];
        if (req.isAuthenticated() && req.user) {
            const cartDoc = await cartModel.findOne({ user: req.user._id }).populate('products.product');
            if (cartDoc && cartDoc.products.length > 0) {
                somethingInCart = true;
                cartCount = cartDoc.products.length;
                cart = cartDoc.products;
            }
        }
        // Fetch all categories for the navbar
        const categories = await categoryModel.find({});
        res.render("index", { rnproducts, products, somethingInCart, cartCount, categories, user: req.user, selectedAddress: req.session.selectedAddress, cart });
    } catch (err) {
        console.error('Index route error:', err);
        res.status(500).send('Error fetching products');
    }
});

// Search route
router.get('/search', async function (req, res) {
    const query = req.query.q || '';
    try {
        // Find products matching the query (case-insensitive, partial match)
        const rnproducts = await productModel.find({
            name: { $regex: query, $options: 'i' }
        });
        // Group products by category
        const products = {};
        rnproducts.forEach(product => {
            if (!products[product.category]) {
                products[product.category] = [];
            }
            products[product.category].push(product);
        });
        // Fetch all categories for the navbar
        const categories = await categoryModel.find({});
        // Get cartCount if user is logged in
        let cartCount = 0;
        if (req.isAuthenticated && req.isAuthenticated() && req.user) {
            const cart = await cartModel.findOne({ user: req.user._id });
            if (cart && cart.products.length > 0) {
                cartCount = cart.products.length;
            }
        }
        res.render('search_results', { query, rnproducts, products, categories, cartCount, user: req.user });
    } catch (err) {
        console.error('Search route error:', err);
        res.status(500).send('Error searching products');
    }
});

// Login route (placeholder)
router.get('/login', async (req, res) => {
    // Fetch categories for the footer (empty array if not needed)
    const categories = await categoryModel.find({});
    res.render('user_login', { categories, cartCount: 0, user: req.user });
});

router.get('/profile', async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/login');
    }
    const categories = await categoryModel.find({});
    let cartCount = 0;
    if (req.user) {
        const cart = await cartModel.findOne({ user: req.user._id });
        if (cart && cart.products.length > 0) {
            cartCount = cart.products.length;
        }
    }
    res.render('user_profile', { user: req.user, categories, cartCount });
});

router.get('/order/:userid/:orderid/:paymentid/:signature', async (req, res) => {
    const { userid, orderid, paymentid, signature } = req.params;
    const payment = await require('../models/payment').paymentModel.findOne({ orderId: orderid });
    const order = await require('../models/order').orderModel.findOne({ orderId: orderid });
    res.render('order_success', {
        userid,
        orderid,
        paymentid,
        signature,
        payment,
        user: req.user,
        categories: [],
        cartCount: 0,
        orderAddress: order ? order.address : null
    });
});

router.get('/map/:orderid', async (req, res) => {
    const { orderid } = req.params;
    // Find the order by orderId and populate products
    const order = await orderModel.findOne({ orderId: orderid }).populate('products');
    // Find the delivery info for this order
    let delivery = null;
    if (order) {
        delivery = await deliveryModel.findOne({ order: order._id });
    }
    // Prepare orderProducts for summary (with product details)
    let orderProducts = [];
    if (order && order.products && order.products.length > 0) {
        // If you have quantity info, adjust this structure accordingly
        orderProducts = order.products.map(prod => ({ product: prod, quantity: 1 }));
    }
    // Pass status, estimated time, and order address (for EJS logic)
    res.render('map', {
        orderid,
        orderStatus: order ? order.status : 'N/A',
        estimatedDeliveryTime: delivery ? delivery.estimatedDeliveryTime : null,
        orderAddress: order ? order.address : null,
        selectedAddress: req.session.selectedAddress || null,
        orderProducts
    });
});

module.exports = router;