const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, staffOrAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, staffOrAdmin, createProduct);

router.route('/:slugOrId')
  .get(getProductBySlug);

router.route('/:id/related')
  .get(getRelatedProducts);

router.route('/:id')
  .put(protect, staffOrAdmin, updateProduct)
  .delete(protect, staffOrAdmin, deleteProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;