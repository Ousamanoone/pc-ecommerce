const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null nghĩa là thông báo chung cho Admin/Staff
    },
    roleTarget: {
      type: String,
      enum: ['ALL', 'ADMIN', 'CUSTOMER'],
      default: 'ALL',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ORDER_CREATED', 'PAYMENT_CONFIRMED', 'STATUS_UPDATED', 'STOCK_ALERT'],
      default: 'STATUS_UPDATED',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);