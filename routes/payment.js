require("dotenv").config();
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { paymentModel } = require("../models/payment");
const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils");
const { orderModel } = require("../models/order");
const { cartModel } = require("../models/cart");
const { deliveryModel } = require("../models/delivery");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create Razorpay Order
router.post("/create/orderId", async (req, res) => {
    const options = {
        amount: 5000 * 100, // amount in paiseyyyyyy (₹5000)
        currency: "INR",
    };

    try {
        const order = await razorpay.orders.create(options);

        await paymentModel.create({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: "pending",
        });

        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Error creating order");
    }
});

// Route to verify Razorpay Payment
router.post("/api/payment/verify", async (req, res) => {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.razorpayOrderId;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
    const signature = req.body.signature;
    const userId = req.body.userId;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    try {
        const result = validatePaymentVerification(
            { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
            signature,
            secret
        );

        if (result) {
            const payment = await paymentModel.findOne({ orderId: razorpay_order_id, status: "pending" });

            if (!payment) {
                return res.status(404).json({ status: "failed", message: "Order not found in DB" });
            }

            payment.paymentId = razorpay_payment_id;
            payment.signature = signature;
            payment.status = "completed";
            await payment.save();

            // Create order in DB
            let cart = null;
            if (userId) {
                cart = await cartModel.findOne({ user: userId });
            }
            if (cart && cart.products.length > 0) {
                const newOrder = await orderModel.create({
                    orderId: razorpay_order_id,
                    user: cart.user,
                    products: cart.products.map(p => p.product),
                    totalPrice: cart.totalPrice,
                    address: "N/A", // You can update this to use real address
                    status: "confirmed",
                    payment: payment._id
                });
                // Create delivery document
                await deliveryModel.create({
                    order: newOrder._id,
                    deliveryBoy: "Raju",
                    status: "pending",
                    estimatedDeliveryTime: 15,
                    totalPrice: cart.totalPrice,
                    currentLocation: { lat: 28.6139, lng: 77.2090 }
                });
                // Optionally clear the cart
                cart.products = [];
                cart.totalPrice = 0;
                await cart.save();
            }

            res.json({ status: "success" });
        } else {
            res.status(400).json({ status: "failed", message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
