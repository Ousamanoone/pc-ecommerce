const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['support', 'internal'],
      default: 'support',
      // 'support': Khách hàng <-> Nhân viên
      // 'internal': Kênh nội bộ Nhân viên <-> Admin
    },
    // Người tham gia (nếu là user đã đăng ký)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Dữ liệu khách (hỗ trợ cả khách vãng lai chưa login qua guestId)
    customerInfo: {
      guestId: { type: String, default: null },
      name: { type: String, default: 'Guest Customer' },
      email: { type: String, default: null },
    },
    // Tin nhắn mới nhất phục vụ hiển thị preview ở danh sách
    lastMessage: {
      content: { type: String, default: '' },
      senderName: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
    unreadCountStaff: { type: Number, default: 0 },
    unreadCountCustomer: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);