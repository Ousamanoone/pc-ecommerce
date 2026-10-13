const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getAdminBlogs,
  getBlogBySlug,
  createBlog,
  moderateBlog,
  deleteBlog,
} = require('../controllers/blogController');

let authMiddleware;
try {
  authMiddleware = require('../middlewares/authMiddleware');
} catch (e) {
  authMiddleware = require('../middleware/authMiddleware');
}

const protect = authMiddleware.protect;
const requireStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin or Staff only.' });
  }
};

// 1. Route công khai
router.get('/', getBlogs);

// 2. ROUTE NÀY PHẢI ĐẶT TRƯỚC /:slug
router.get('/admin/all', protect, requireStaffOrAdmin, getAdminBlogs);

// 3. Route lấy theo slug
router.get('/:slug', getBlogBySlug);

// 4. Các thao tác quản trị
router.post('/', protect, requireStaffOrAdmin, createBlog);
router.put('/:id/moderate', protect, requireStaffOrAdmin, moderateBlog);
router.delete('/:id', protect, requireStaffOrAdmin, deleteBlog);

module.exports = router;