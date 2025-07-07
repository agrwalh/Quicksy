const express = require('express');
const { paymentModel } = require('../models/payment');
const { orderModel } = require('../models/order'); // Import this
const { cartModel } = require('../models/cart');   // Import this
const { deliveryModel } = require('../models/delivery');

const router = express.Router();

// GET route to verify payment and create order
router.get("/:userid/:orderid/:paymentid/:signature", async function (req, res) {
   try {
      const { userid, orderid, paymentid, signature } = req.params;
      const paymentDetails = await paymentModel.findOne({ orderId: orderid });

      if (!paymentDetails) {
         return res.send("Sorry, This order does not exist");
      }

      if (signature === paymentDetails.signature && paymentid === paymentDetails.paymentId) {
         const cart = await cartModel.findOne({ user: userid });

         if (!cart) {
            return res.send("Cart not found for user");
         }

         // Create order
         const order = await orderModel.create({
            orderId: orderid,
            user: userid,
            products: cart.products,
            totalPrice: cart.totalPrice,
            status: "processing",
            payment: paymentDetails._id,
            address: req.session.selectedAddress && req.session.selectedAddress.address ? (req.session.selectedAddress.address + ', ' + req.session.selectedAddress.city + ', ' + req.session.selectedAddress.state + ' - ' + req.session.selectedAddress.zip) : "N/A"
         });

         // Create delivery document
         await deliveryModel.create({
            order: order._id,
            deliveryBoy: "Raju", // or assign dynamically
            status: "pending",
            estimatedDeliveryTime: 15, // default, can update later
            totalPrice: cart.totalPrice
         });

         return res.redirect(`/map/${orderid}`);
      } else {
         return res.send("Payment details do not match");
      }
   } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
   }
});

// POST route to add address to the order
router.post("/address/:orderid", async function (req, res) {
   try {
      const { address, lat, lng } = req.body;
      console.log('Received address:', address, 'lat:', lat, 'lng:', lng);
      const order = await orderModel.findOne({ orderId: req.params.orderid });

      if (!order) return res.send("Sorry, This order does not exist");
      if (!address) return res.send("Address is required");

      order.address = address;
      await order.save();

      // Update delivery estimated time (simulate recalculation)
      const delivery = await deliveryModel.findOne({ order: order._id });
      if (delivery) {
        delivery.estimatedDeliveryTime = 15; // You can recalculate based on address if needed
        // Store destination coordinates if provided (for automation)
        let destination = null;
        if (lat && lng) {
          destination = { lat: parseFloat(lat), lng: parseFloat(lng) };
          console.log('Using provided lat/lng:', destination);
        } else {
          // Geocode the address using Nominatim
          try {
            // Use dynamic import for node-fetch (ESM compatibility)
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            const query = encodeURIComponent(address);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
            const response = await fetch(url, { headers: { 'User-Agent': 'quicksy-app/1.0' } });
            const data = await response.json();
            console.log('Geocoding result:', data);
            if (data && data.length > 0) {
              destination = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
              console.log('Geocoded destination:', destination);
            }
          } catch (geoErr) {
            console.error('Geocoding error:', geoErr);
          }
        }
        if (destination) {
          delivery.destination = destination;
          await delivery.save();
        } else {
          console.error('No destination could be set for delivery!');
        }
      }

      return res.redirect(`/map/${order.orderId}`);
   } catch (err) {
      console.error('Order address update error:', err);
      res.status(500).send("Internal server error: " + err.message);
   }
});

// GET delivery boy location for live tracking
router.get('/delivery/location/:orderid', async (req, res) => {
  const { orderid } = req.params;
  const order = await orderModel.findOne({ orderId: orderid });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const delivery = await deliveryModel.findOne({ order: order._id });
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  res.json({ location: delivery.currentLocation });
});

// POST endpoint to update delivery boy location (for simulation/demo)
router.post('/delivery/location/:orderid', async (req, res) => {
  const { orderid } = req.params;
  const { lat, lng } = req.body;
  const order = await orderModel.findOne({ orderId: orderid });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const delivery = await deliveryModel.findOne({ order: order._id });
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  delivery.currentLocation = { lat, lng };
  await delivery.save();
  res.json({ success: true });
});

// GET delivery info for simulation script
router.get('/delivery/info/:orderid', async (req, res) => {
  const { orderid } = req.params;
  const order = await orderModel.findOne({ orderId: orderid });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const delivery = await deliveryModel.findOne({ order: order._id });
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  res.json({ destination: delivery.destination });
});

router.get('/map/:orderid', async (req, res) => {
    const { orderid } = req.params;
    // Find the order by orderId
    const order = await orderModel.findOne({ orderId: orderid });
    // Find the delivery info for this order
    let delivery = null;
    if (order) {
        delivery = await deliveryModel.findOne({ order: order._id });
    }
    // Pass status, estimated time, and order address (for EJS logic)
    res.render('map', {
        orderid,
        orderStatus: order ? order.status : 'N/A',
        estimatedDeliveryTime: delivery ? delivery.estimatedDeliveryTime : null,
        orderAddress: order ? order.address : null,
        selectedAddress: req.session.selectedAddress || null
    });
});

module.exports = router;
