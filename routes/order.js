const express=require('express');
const { paymentModel } = require('../models/payment');
const router=express.Router();


router.get("/:orderid/:paymentid/:signature", async function (req, res) {
   let paymentDetails = await paymentModel.findOne({ orderId: req.params.orderid });

   if (!paymentDetails) return res.send("Sorry, This order Does not exist");
   if (
      req.params.signature === paymentDetails.signature &&
      req.params.paymentid === paymentDetails.paymentId
   ) {
      return res.send("Payment completed successfully");
   }else{

   res.send("Payment details do not match");
   }
});




module.exports=router;