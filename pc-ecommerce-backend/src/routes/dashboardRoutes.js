const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, staffOrAdmin } = require('../middlewares/authMiddleware');

router.get('/stats', protect, staffOrAdmin, getDashboardStats);

module.exports = router;