// ⭐ Secure Admin APIs with API Key (stored in .env)

const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ message: "🔒 Invalid or missing API Key." });
    }
    next();
};

module.exports = apiKeyAuth;
