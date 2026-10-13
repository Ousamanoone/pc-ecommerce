const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    badgeText: {
      type: String,
      default: 'SPECIAL PROMOTION',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
      default: '/products',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);