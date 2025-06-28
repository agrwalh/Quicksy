const express = require('express');
const router = express.Router();
const { cartModel, validateCategory } = require('../models/cart');
const { validateAdmin, userIsLoggedIn } = require('../middlewares/admin');
const { productModel } = require('../models/product'); // <-- FIXED

// Test route to check if cart is working
router.get("/test", async (req, res) => {
    try {
        res.json({ 
            message: "Cart route is working",
            authenticated: req.isAuthenticated(),
            user: req.user,
            session: req.session
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET cart page - render cart view
router.get("/", userIsLoggedIn, async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.session.passport.user }).populate('products.product');
        if (!cart) {
            cart = { products: [], totalPrice: 0 };
        }
        // Remove items with missing products
        const originalLength = cart.products.length;
        cart.products = cart.products.filter(item => item.product && typeof item.product === 'object' && item.product.name);
        if (cart.products.length !== originalLength && cart._id) {
            // Recalculate total price
            cart.totalPrice = 0;
            for (const item of cart.products) {
                cart.totalPrice += Number(item.product.price) * item.quantity;
            }
            await cart.save();
        }
        // Calculate final price with delivery charges
        const finalprice = cart.totalPrice + 34; // 30 delivery + 4 handling
        res.render('cart', {
            cart: cart.products,
            finalprice: finalprice,
            userid: req.session.passport.user
        });
    } catch (err) {
        res.status(500).render('cart', {
            cart: [],
            finalprice: 34,
            userid: req.session.passport.user,
            error: 'Error loading cart: ' + err.message
        });
    }
});

// GET cart data as JSON (for API calls)
router.get("/data", userIsLoggedIn, async (req, res) => {
    try {
        const cart = await cartModel.findOne({ user: req.session.passport.user }).populate('products');
        res.json(cart || { products: [], totalPrice: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add product to cart (with quantity)
router.get("/add/:id", userIsLoggedIn, async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.session.passport.user });
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        if (!cart) {
            cart = await cartModel.create({
                user: req.session.passport.user,
                products: [{ product: req.params.id, quantity: 1 }],
                totalPrice: Number(product.price)
            });
        } else {
            // Find if product already in cart
            const prodIndex = cart.products.findIndex(p => p.product.toString() === req.params.id);
            if (prodIndex > -1) {
                cart.products[prodIndex].quantity += 1;
            } else {
                cart.products.push({ product: req.params.id, quantity: 1 });
            }
            // Recalculate total price
            cart.totalPrice = 0;
            for (const item of cart.products) {
                const prod = await productModel.findById(item.product);
                cart.totalPrice += Number(prod.price) * item.quantity;
            }
            await cart.save();
        }
        res.redirect('/cart');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Remove product from cart (decrement quantity or remove)
router.get("/remove/:id", userIsLoggedIn, async (req, res) => {
    try {
        const cart = await cartModel.findOne({ user: req.session.passport.user });
        if (!cart) return res.redirect('/cart');
        const prodIndex = cart.products.findIndex(p => p.product.toString() === req.params.id);
        if (prodIndex > -1) {
            if (cart.products[prodIndex].quantity > 1) {
                cart.products[prodIndex].quantity -= 1;
            } else {
                cart.products.splice(prodIndex, 1);
            }
            // Recalculate total price
            cart.totalPrice = 0;
            for (const item of cart.products) {
                const prod = await productModel.findById(item.product);
                cart.totalPrice += Number(prod.price) * item.quantity;
            }
            if (cart.products.length === 0) {
                await cartModel.findByIdAndDelete(cart._id);
            } else {
                await cart.save();
            }
        }
        res.redirect('/cart');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
