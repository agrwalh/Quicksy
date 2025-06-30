const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const paymentSchema = new mongoose.Schema({
  orderId: {
    type:String,
    required:true,
  },
  paymentId:{
    type:String,
  },
  signature:{
    type:String,
  },
 
  amount:{
    type:Number,
    required:true,
  },
  currency:{
    type:String,
    required:true,
  },
  status:{
    type:String,
    default:"pending",
  },
}, {
  timestamps: true
});

// Mongoose Model
const Payment = mongoose.model('Payment', paymentSchema);

// Joi Validation Function
function validatePayment(data) {
  const schema = Joi.object({
    order: Joi.string().length(24).required(),
    amount: Joi.number().min(0).required(),
    method: Joi.string().required(),
    status: Joi.string().required(), 
    transactionId: Joi.string().required()
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  paymentModel: Payment,
  validatePayment
};
