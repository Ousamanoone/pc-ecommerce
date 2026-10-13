const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const specSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'CPU',
        'GPU',
        'Mainboard',
        'Motherboard',
        'RAM',
        'Storage',
        'SSD',
        'PSU',
        'Case',
        'Cooling',
        'Cooler',
        'Monitor',
        'Gear',
      ],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    wattage: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    specs: [specSchema],
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);