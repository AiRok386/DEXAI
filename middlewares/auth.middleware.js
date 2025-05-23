const jwt = require('jsonwebtoken');

// ✅ Middleware: Protect user routes
function protectUser(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

// ✅ Middleware: Protect admin routes
function protectAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!['admin', 'superadmin'].includes(decoded.role)) {
            return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

// ✅ Alias for adminAuthMiddleware so your routes remain unchanged
const adminAuthMiddleware = protectAdmin;

// ✅ Export all
module.exports = {
    protectUser,
    protectAdmin,
    adminAuthMiddleware, // This is the named export you'll import
};
