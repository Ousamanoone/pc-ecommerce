const Banner = require('../models/Banner');

// @desc    Get active banners for storefront carousel
// @route   GET /api/v1/banners/active
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all banners for admin management
// @route   GET /api/v1/banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new promotional banner
// @route   POST /api/v1/banners
exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update banner details or status
// @route   PUT /api/v1/banners/:id
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete banner
// @route   DELETE /api/v1/banners/:id
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json({ message: 'Banner removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};