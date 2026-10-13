const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get aggregated dashboard analytics and inventory health
// @route   GET /api/v1/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate Total Revenue from non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // 2. Orders Metrics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    // 3. User Accounts Count
    const totalUsers = await User.countDocuments();

    // 4. Critical Low Stock Products (Stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name brand category price stock images slug')
      .sort({ stock: 1 })
      .limit(8);

    // 5. Recent 6 Transactions
    const recentOrders = await Order.find()
      .select('orderCode shippingAddress totalPrice paymentMethod status isPaid createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

    // 6. Category Inventory Distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalUsers,
      criticalStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders,
      categoryDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};