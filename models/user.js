const mongoose = require('mongoose');
const Joi = require('joi');

// Address Schema (Mongoose)
const AddressSchema = new mongoose.Schema({
  state: { type: String },
  zip: { type: Number },
  city: { type: String },
  address: { type: String }
});

// User Schema (Mongoose)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: Number },
  addresses: [AddressSchema],
}, {
  timestamps: true
});

// Mongoose model
const User = mongoose.model('User', userSchema);

// Joi Validation Function
function validateUser(data) {
  const addressSchema = Joi.object({
    state: Joi.string().required(),
    zip: Joi.number().required(),
    city: Joi.string().required(),
    address: Joi.string().required()
  });

  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.number().min(1000000000).max(9999999999).required(), // 10-digit phone
    addresses: Joi.array().items(addressSchema)
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  userModel:mongoose.model('user', userSchema),
  validateUser
};
