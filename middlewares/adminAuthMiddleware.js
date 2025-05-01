// ✅ middlewares/adminAuthMiddleware.js
const jwt = require('jsonwebtoken');

function adminAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'superadmin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Admin privileges required.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = adminAuthMiddleware; // ✅ not inside an object!
