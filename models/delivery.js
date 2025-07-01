const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true
  },
  deliveryBoy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingURL: {
    type: String,
    default: ''
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentLocation: {
    type: { lat: Number, lng: Number },
    default: { lat: 28.6139, lng: 77.2090 } // Start at warehouse (Delhi)
  },
  destination: {
    type: { lat: Number, lng: Number },
    default: null
  }
}, {
  timestamps: true
});

// Mongoose Model
const Delivery = mongoose.model('Delivery', deliverySchema);

// Joi Validation Function
function validateDelivery(data) {
  const schema = Joi.object({
    order: Joi.string().length(24).required(),
    deliveryBoy: Joi.string().min(2).required(),
    status: Joi.string().valid('pending', 'shipped', 'in-transit', 'delivered', 'cancelled'),
    trackingURL: Joi.string().uri().allow('').optional(),
    estimatedDeliveryTime: Joi.number().min(1).required(), // in minutes or hours (your call)
    totalPrice: Joi.number().min(0).required()
  });

  return schema.validate(data);
}

// Exports
module.exports = {
  deliveryModel: mongoose.model('Delivery', deliverySchema),
  validateDelivery
};
