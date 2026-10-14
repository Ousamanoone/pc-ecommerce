const express = require('express');
const router = express.Router();
const SiteSetting = require('../models/SiteSetting');

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
      res.status(403).json({ message: 'Chỉ Admin hoặc Staff mới có quyền chỉnh sửa.' });
    }
  });

// GET /api/v1/settings - Công khai cho toàn bộ khách hàng
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSetting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await SiteSetting.create({ key: 'global_settings' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/v1/settings - Cho phép cả Admin và Staff cập nhật link Fanpage
router.put('/', protect, staffOrAdmin, async (req, res) => {
  try {
    const {
      facebookUrl,
      messengerUrl,
      zaloUrl,
      tiktokUrl,
      youtubeUrl,
      hotline,
      supportEmail,
      showFloatingSocial,
    } = req.body;

    const updated = await SiteSetting.findOneAndUpdate(
      { key: 'global_settings' },
      {
        $set: {
          facebookUrl: facebookUrl ?? '',
          messengerUrl: messengerUrl ?? '',
          zaloUrl: zaloUrl ?? '',
          tiktokUrl: tiktokUrl ?? '',
          youtubeUrl: youtubeUrl ?? '',
          hotline: hotline ?? '',
          supportEmail: supportEmail ?? '',
          showFloatingSocial: showFloatingSocial !== undefined ? showFloatingSocial : true,
        },
      },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;