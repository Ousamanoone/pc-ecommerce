const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getOrCreateCustomerConversation,
  getInternalConversation,
  getConversations,
  getMessages,
} = require('../controllers/chatController');
const { protect, staffOrAdmin } = require('../middlewares/authMiddleware');

// Middleware xác thực mềm: Có token hợp lệ thì gán req.user, nếu token hết hạn/lỗi thì vẫn cho qua dưới dạng khách
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null; // Token sai/hết hạn -> xem như khách vãng lai
    }
  }
  next();
};

// Khách hàng khởi tạo / lấy phòng chat (hoạt động cho cả khách lẫn thành viên)
router.post('/conversation', optionalAuth, getOrCreateCustomerConversation);

// Kênh nội bộ (Yêu cầu nhân viên/admin)
router.get('/internal-room', protect, staffOrAdmin, getInternalConversation);

// Danh sách hội thoại hỗ trợ (Dành cho Staff/Admin)
router.get('/conversations', protect, staffOrAdmin, getConversations);

// Lịch sử tin nhắn
router.get('/messages/:conversationId', getMessages);

module.exports = router;