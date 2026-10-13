const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

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
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Restricted area: Staff or Admin privileges required' });
    }
  });

router.get('/active', getActiveBanners);

router
  .route('/')
  .get(protect, staffOrAdmin, getBanners)
  .post(protect, staffOrAdmin, createBanner);

router
  .route('/:id')
  .put(protect, staffOrAdmin, updateBanner)
  .delete(protect, staffOrAdmin, deleteBanner);

module.exports = router;