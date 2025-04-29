const Token = require('../models/token.model');

// ⭐ Admin Create New Token
exports.createToken = async (req, res) => {
    try {
        const { name, symbol, iconUrl, contractAddress, decimals, pairWith } = req.body;

        const token = new Token({
            name,
            symbol,
            iconUrl,
            contractAddress,
            decimals,
            pairWith
        });

        await token.save();
        res.status(201).json({ message: 'Token created successfully', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Admin Edit Token
exports.updateToken = async (req, res) => {
    try {
        const tokenId = req.params.id;
        const updateData = req.body;

        const token = await Token.findByIdAndUpdate(tokenId, updateData, { new: true });

        if (!token) return res.status(404).json({ message: 'Token not found' });

        res.status(200).json({ message: 'Token updated', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Admin Delete Token
exports.deleteToken = async (req, res) => {
    try {
        const tokenId = req.params.id;

        const token = await Token.findByIdAndDelete(tokenId);

        if (!token) return res.status(404).json({ message: 'Token not found' });

        res.status(200).json({ message: 'Token deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Public: Get All Active Tokens
exports.getActiveTokens = async (req, res) => {
    try {
        const tokens = await Token.find({ status: 'active' });
        res.status(200).json(tokens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
