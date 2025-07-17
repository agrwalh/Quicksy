const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    minlength:3,
    maxlength:50,
  },
  stock: {
    type: Number,
    required: true
  },
  description: {
    type: String,
  },
  images: [{
    type: Buffer,
  }],
  image: {
    type: Buffer, // for backward compatibility
  },
}, {
  timestamps: true
});

// Mongoose Model
const Product = mongoose.model('Product', productSchema);

// Joi Validation Function
function validateProduct(data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().min(3).max(50).required(),
    stock: Joi.number().required(),
    description: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    image: Joi.string().optional(),
  });
  return schema.validate(data);
}

// Exports
module.exports = {
productModel: mongoose.model('Product', productSchema),
  validateProduct
};
