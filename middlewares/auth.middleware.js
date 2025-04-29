const jwt = require('jsonwebtoken');

// ⭐ Middleware to protect user routes
exports.protectUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // store user info
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// ⭐ Middleware to protect admin routes
exports.protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
            return res.status(403).json({ message: 'Admin access denied' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
