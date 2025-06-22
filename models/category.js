const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

// Mongoose Model
const Category = mongoose.model('Category', categorySchema);

// Joi Validation Function
function validateCategory(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required()
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  categoryModel: mongoose.model('Category', categorySchema),
  validateCategory
};
