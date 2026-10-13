const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// @desc    Get current logged in user profile
// @route   GET /api/v1/users/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile & default delivery info
// @route   PUT /api/v1/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.city = req.body.city !== undefined ? req.body.city : user.city;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user account password
// @route   PUT /api/v1/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match our records.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Account password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with search and role filter (Admin only)
// @route   GET /api/v1/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'ALL') {
      query.role = role.toLowerCase();
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          orderCount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user permission role (Admin only)
// @route   PUT /api/v1/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'staff', 'admin'];

    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid permission role specified.' });
    }

    if (req.user._id.toString() === req.params.id && role.toLowerCase() !== 'admin') {
      return res.status(400).json({ message: 'You cannot revoke your own administrator privileges.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: role.toLowerCase() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/v1/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    res.json({ message: 'User account permanently removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin tạo và cấp tài khoản cho Staff
// @route   POST /api/v1/users/provision-staff
// @access  Private/AdminOnly
exports.provisionStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash mật khẩu an toàn
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staffUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'staff', // Khóa cứng role staff
      isVerified: true, // Được xác thực trực tiếp bởi Admin
    });

    res.status(201).json({
      message: 'Staff account successfully provisioned.',
      user: {
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        createdAt: staffUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Admin tạo và cấp tài khoản cho Staff
// @route   POST /api/v1/users/provision-staff
// @access  Private/AdminOnly
exports.provisionStaff = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const staffUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      phone: phone || '',
      role: 'staff',
      isVerified: true,
    });

    await staffUser.save();

    // Nếu Model User chưa tự hash trong pre('save') thì mới hash thủ công
    if (!staffUser.password.startsWith('$2a$') && !staffUser.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.updateOne({ _id: staffUser._id }, { $set: { password: hashedPassword } });
    }

    res.status(201).json({
      message: 'Staff account successfully provisioned.',
      user: {
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        createdAt: staffUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};