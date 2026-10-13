const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

// ==================== KHÁCH HÀNG (CUSTOMER) ====================

// @desc    Tạo đơn hàng mới & trừ trực tiếp tồn kho
// @route   POST /api/v1/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      discountPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items specified." });
    }

    // 1. Kiểm tra số lượng tồn kho thực tế của từng linh kiện
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Component not found: ${item.name}` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient inventory for "${product.name}". Available: ${product.stock}, Requested: ${item.qty}`,
        });
      }
    }

    // 2. Trừ tồn kho từng linh kiện
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    // 3. Khởi tạo và lưu đơn hàng
    const order = new Order({
      user: req.user ? req.user._id : null,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      discountPrice: discountPrice || 0,
      totalPrice,
      status: "Pending",
      isPaid: false,
    });

    const createdOrder = await order.save();
    // Bắn thông báo đơn hàng mới cho Admin
    try {
      const newNotif = await Notification.create({
        roleTarget: "ADMIN",
        title: "New Hardware Order Placed",
        message: `Order #${createdOrder._id.slice(-6).toUpperCase()} placed for $${totalPrice} via ${paymentMethod}.`,
        type: "ORDER_CREATED",
        link: "/admin/orders",
      });

      const io = req.app.get("io");
      if (io) {
        io.emit("newNotification", newNotif);
      }
    } catch (err) {
      console.error("Notification creation error:", err);
    }
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tra cứu chi tiết một đơn hàng theo ID (TrackOrderPage)
// @route   GET /api/v1/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res.status(404).json({ message: "Order reference not found." });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách đơn hàng của người dùng đang đăng nhập
// @route   GET /api/v1/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== QUẢN TRỊ VIÊN (ADMIN / STAFF) ====================

// @desc    Lấy toàn bộ đơn hàng
// @route   GET /api/v1/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đơn hàng & hoàn kho nếu hủy đơn
// @route   PUT /api/v1/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const previousStatus = order.status;

    // Hoàn lại tồn kho nếu đơn bị Cancelled (và trước đó chưa bị Cancelled)
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty },
        });
      }
    }

    // Trừ lại tồn kho nếu mở lại đơn từ Cancelled sang trạng thái khác
    if (previousStatus === "Cancelled" && status !== "Cancelled") {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty },
        });
      }
    }

    order.status = status;
    if (status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    // Bắn thông báo trạng thái giao hàng cho khách hàng
    try {
      if (order.user) {
        const statusNotif = await Notification.create({
          recipient: order.user,
          roleTarget: "CUSTOMER",
          title: "Order Status Update",
          message: `Your order #${order._id.slice(-6).toUpperCase()} is now "${status}".`,
          type: "STATUS_UPDATED",
          link: `/track-order?orderId=${order._id}`,
        });

        const io = req.app.get("io");
        if (io) {
          io.emit("newNotification", statusNotif);
        }
      }
    } catch (err) {
      console.error("Status notification error:", err);
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xác nhận / Hoàn tác thanh toán VietQR
// @route   PUT /api/v1/orders/:id/pay
exports.updateOrderToPaid = async (req, res) => {
  try {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.isPaid = isPaid !== undefined ? isPaid : true;
    order.paidAt = order.isPaid ? Date.now() : null;

    const updatedOrder = await order.save();
    // Bắn thông báo xác nhận thanh toán
    try {
      if (order.user && order.isPaid) {
        const payNotif = await Notification.create({
          recipient: order.user,
          roleTarget: "CUSTOMER",
          title: "Payment Confirmed",
          message: `VietQR transfer of $${order.totalPrice} for order #${order._id.slice(-6).toUpperCase()} has been settled.`,
          type: "PAYMENT_CONFIRMED",
          link: `/track-order?orderId=${order._id}`,
        });

        const io = req.app.get("io");
        if (io) {
          io.emit("newNotification", payNotif);
        }
      }
    } catch (err) {
      console.error("Payment notification error:", err);
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa vĩnh viễn một đơn hàng
// @route   DELETE /api/v1/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    await order.deleteOne();
    res.json({ message: "Order record deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
