const express = require('express');
const router = express.Router();
const { getAllMediaFiles, deleteMediaFile } = require('../controllers/mediaController');
const { protect, staffOrAdmin } = require('../middlewares/authMiddleware');

router.get('/', protect, staffOrAdmin, getAllMediaFiles);
router.delete('/:filename', protect, staffOrAdmin, deleteMediaFile);

module.exports = router;