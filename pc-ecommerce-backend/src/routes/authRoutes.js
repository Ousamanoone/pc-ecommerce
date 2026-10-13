const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đảm bảo hàm tồn tại trước khi gán vào router
if (authController.register) {
  router.post('/register', authController.register);
}

if (authController.login) {
  router.post('/login', authController.login);
}

// Nếu có route getMe/profile thì kiểm tra hàm tồn tại
if (authController.getMe) {
  let protectMiddleware = (req, res, next) => next();
  try {
    const authMw = require('../middlewares/authMiddleware') || require('../middleware/authMiddleware');
    if (authMw && authMw.protect) protectMiddleware = authMw.protect;
  } catch (e) {}

  router.get('/me', protectMiddleware, authController.getMe);
}

module.exports = router;