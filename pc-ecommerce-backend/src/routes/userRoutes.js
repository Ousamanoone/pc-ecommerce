const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUsers,
  updateUserRole,
  deleteUser,
  provisionStaff,
} = require('../controllers/userController');

let authMiddleware;
try {
  authMiddleware = require('../middlewares/authMiddleware');
} catch (e) {
  authMiddleware = require('../middleware/authMiddleware');
}

const protect = authMiddleware.protect;

const staffOrAdmin =
  authMiddleware.staffOrAdmin ||
  ((req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
      next();
    } else {
      res.status(403).json({ message: 'Staff or Admin privilege required.' });
    }
  });

const adminOnly =
  authMiddleware.adminOnly ||
  ((req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Strict Admin privilege required.' });
    }
  });

// 1. Routes dành cho Khách hàng & User đã đăng nhập
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

// 2. Routes dành cho Admin / Staff quản lý tài khoản
router.get('/', protect, staffOrAdmin, getUsers);
router.post('/provision-staff', protect, adminOnly, provisionStaff);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;