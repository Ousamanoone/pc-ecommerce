const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getActiveCoupons,
  getCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, adminOnly, staffOrAdmin } = require('../middlewares/authMiddleware');

router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

router.route('/')
  .get(protect, staffOrAdmin, getCoupons)
  .post(protect, adminOnly, createCoupon);

router.route('/:id')
  .delete(protect, adminOnly, deleteCoupon);

module.exports = router;