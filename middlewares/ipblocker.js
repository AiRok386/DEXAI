// ⭐ List of Banned IPs (you can store in DB later)
const bannedIps = [
    '111.222.333.444', // Example: Attackers IP
    '123.456.789.000'
];

// ⭐ Middleware to Block Banned IPs
const ipBlocker = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    if (bannedIps.includes(ip)) {
        return res.status(403).json({ message: "🚫 Your IP is banned from this server." });
    }
    next();
};

module.exports = ipBlocker;
