// ✅ middlewares/adminMiddleware.js
const jwt = require('jsonwebtoken');

function adminMiddleware(req, res, next) {
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
const protectAdmin = (req, res, next) => {
  // Check if user is admin
  if (req.user && req.user.role === 'admin') {
    next(); // Continue to the next middleware/route handler
  } else {
    res.status(403).send('Forbidden: Admin access required');
  }
};

module.exports = { protectAdmin };

module.exports = adminMiddleware; // ✅ not inside an object!
