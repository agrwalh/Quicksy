const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'payment',
    required: true
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'delivery'
  }
}, {
  timestamps: true
});

// Mongoose Model
const Order = mongoose.model('Order', orderSchema);

// Joi Validation Function
function validateOrder(data) {
  const schema = Joi.object({
    user: Joi.string().length(24).required(),
    products: Joi.array().items(Joi.string().length(24)).min(1).required(),
    totalPrice: Joi.number().min(0).required(),
    address: Joi.string().min(5).required(),
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').optional(),
    payment: Joi.string().length(24).required(),
    delivery: Joi.string().length(24).optional()
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  orderModel: mongoose.model('Order', orderSchema),
  validateOrder
};
