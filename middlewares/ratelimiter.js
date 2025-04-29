const rateLimit = require('express-rate-limit');

// ⭐ Basic Rate Limiter Middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "⚠️ Too many requests from this IP, please try again later.",
});

module.exports = apiLimiter;
