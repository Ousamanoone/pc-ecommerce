const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Đăng ký tài khoản Khách hàng
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'Email address already registered' });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      phone: phone || '',
      role: 'customer',
    });

    await user.save();

    // Chỉ hash thủ công nếu User model không có pre('save') hook
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
    }

    const secret = process.env.JWT_SECRET || 'gearstore_fallback_secret_key_2026';
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      ...userPayload,
      token,
      user: userPayload,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Đăng nhập hệ thống (Customer / Staff / Admin)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let isMatch = false;
    if (user.password) {
      if (typeof user.matchPassword === 'function') {
        isMatch = await user.matchPassword(password);
      } else {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'gearstore_fallback_secret_key_2026';
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      ...userPayload,
      token,
      user: userPayload,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};