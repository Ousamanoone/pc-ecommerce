const Subscriber = require('../models/Subscriber');
const Coupon = require('../models/Coupon');

// @desc    Subscribe to hardware newsletter & receive welcome discount
// @route   POST /api/v1/subscribers
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(400).json({
        message: 'This email is already subscribed to our hardware promotions.',
      });
    }

    await Subscriber.create({ email: cleanEmail });

    // Find or return a standard welcome voucher
    const welcomeCoupon = await Coupon.findOne({
      code: 'WELCOME10',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! Here is your exclusive welcome voucher code.',
      voucherCode: welcomeCoupon ? welcomeCoupon.code : 'WELCOME10',
      discountValue: welcomeCoupon ? welcomeCoupon.discountValue : 10,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};