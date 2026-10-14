const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
    },
    facebookUrl: {
      type: String,
      default: 'https://facebook.com',
    },
    messengerUrl: {
      type: String,
      default: 'https://m.me',
    },
    zaloUrl: {
      type: String,
      default: 'https://zalo.me',
    },
    tiktokUrl: {
      type: String,
      default: '',
    },
    youtubeUrl: {
      type: String,
      default: '',
    },
    hotline: {
      type: String,
      default: '1900 6868',
    },
    supportEmail: {
      type: String,
      default: 'support@gearstore.com',
    },
    showFloatingSocial: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSetting', siteSettingSchema);