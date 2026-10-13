const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'gearstore_fallback_secret_key_2026';
const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Session expired or invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization required. No token provided.' });
  }
};

exports.staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Restricted area: Staff or Admin privileges required' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin credentials only' });
  }
};