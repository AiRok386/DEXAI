// ⭐ Middleware to check admin permissions for specific operations

exports.requireSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== 'superadmin') {
        return res.status(403).json({ message: 'Superadmin access required' });
    }
    next();
};

exports.requireAdminOrSuperAdmin = (req, res, next) => {
    if (!req.admin || (req.admin.role !== 'admin' && req.admin.role !== 'superadmin')) {
        return res.status(403).json({ message: 'Admin or Superadmin access required' });
    }
    next();
};
