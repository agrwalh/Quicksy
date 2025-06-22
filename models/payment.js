const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    // enum: ['credit_card', 'upi', 'netbanking', 'cod','debit_card'],
    required: true
  },
  status: {
    type: String,
    // enum: ['pending', 'successful', 'failed'],
    // default: 'pending'
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  }
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
  paymentModel:mongoose.model('Payment', paymentSchema),
  validatePayment
};
