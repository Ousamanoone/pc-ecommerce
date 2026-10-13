const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized, no token provided' });

    try {
        const secret = process.env.JWT_SECRET || 'gearstore_fallback_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};

module.exports = { protect, adminOnly };