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
    trim: true
  },
  stock: {
    type: Boolean,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    
  }
}, {
  timestamps: true
});

// Mongoose Model
const Product = mongoose.model('Product', productSchema);

// Joi Validation Function
function validateProduct(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.string().required(), // If you plan to do calculations, change this to number
    category: Joi.string().min(2).required(),
    stock: Joi.boolean().optional(),
    description: Joi.string().allow('').optional(),
    image: Joi.string().optional(),
  });

  return schema.validate(data);
}

// Exports
module.exports = {
productModel: mongoose.model('Product', productSchema),
  validateProduct
};
