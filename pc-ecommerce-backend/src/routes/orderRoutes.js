const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updateOrderToPaid,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, staffOrAdmin } = require('../middlewares/authMiddleware');

// Middleware xác thực mềm để cho phép cả khách vãng lai lẫn thành viên đặt hàng
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      req.user = null;
    }
  }
  next();
};

// --- Customer Endpoints ---
router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);

// --- Admin / Staff Endpoints ---
router.get('/', protect, staffOrAdmin, getOrders);
router.put('/:id/status', protect, staffOrAdmin, updateOrderStatus);
router.put('/:id/pay', protect, staffOrAdmin, updateOrderToPaid);
router.delete('/:id', protect, staffOrAdmin, deleteOrder);

module.exports = router;