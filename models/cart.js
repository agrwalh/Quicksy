const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const cartSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

// Mongoose Model
const Cart = mongoose.model('Cart', cartSchema);

// Joi Validation Function
function validateCart(data) {
  const schema = Joi.object({
    user: Joi.string().required().length(24), // ObjectId length
    products: Joi.array().items(Joi.string().length(24)).required(),
    totalPrice: Joi.number().min(0).required()
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  cartModel:mongoose.model('cart', cartSchema),
  validateCart
};
