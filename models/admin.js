const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, {
  timestamps: true
});

// Mongoose Model
const Admin = mongoose.model('Admin', adminSchema);

// Joi Validation Function
function validateAdmin(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'superadmin').optional() // You can customize roles
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  adminModel:mongoose.model('admin', adminSchema),
  validateAdmin
};
