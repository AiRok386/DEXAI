const ICO = require('../models/ICO.model');
const ICOPurchase = require('../models/IcoPurchase.model');

// ⭐ Admin: Create ICO
const createICO = async (req, res) => {
    try {
        const ico = new ICO(req.body);
        await ico.save();
        res.status(201).json({ message: 'ICO created', ico });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Admin: Edit ICO
const updateICO = async (req, res) => {
    try {
        const ico = await ICO.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ico) return res.status(404).json({ message: 'ICO not found' });
        res.status(200).json({ message: 'ICO updated', ico });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Admin: Delete ICO
const deleteICO = async (req, res) => {
    try {
        await ICO.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'ICO deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ Public: Get all Live ICOs
const getLiveICOs = async (req, res) => {
    try {
        const icos = await ICO.find({ status: 'live' });
        res.status(200).json(icos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ⭐ User: Participate in ICO
const buyICO = async (req, res) => {
    try {
        const { icoId, amountUSD } = req.body;
        const userId = req.user.id;

        const ico = await ICO.findById(icoId);
        if (!ico) return res.status(404).json({ message: 'ICO not found' });

        const tokensBought = amountUSD / ico.pricePerToken;

        const purchase = new ICOPurchase({
            userId,
            icoId,
            amountUSD,
            tokensBought,
            status: 'pending'
        });

        await purchase.save();
        res.status(201).json({ message: 'ICO purchase successful', purchase });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Export all handlers
module.exports = {
    createICO,
    updateICO,
    deleteICO,
    getLiveICOs,
    buyICO
};
