const Admin = require('../models/Admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ⭐ Admin Login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate Admin JWT Token
        const token = jwt.sign(
            { adminId: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
