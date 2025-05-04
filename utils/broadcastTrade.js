/**
 * Broadcasts a Bitget trade update to all connected WebSocket clients.
 * @param {Object} io - Socket.IO server instance
 * @param {Object} tradeData - Raw trade object from Bitget WebSocket
 * @param {string} pair - Trading pair symbol (e.g., "BTCUSDT")
 */
function broadcastTrade(io, tradeData, pair) {
    if (!tradeData || !tradeData.p || !tradeData.sz) return;

    io.emit('newTrade', {
        symbol: pair,
        price: parseFloat(tradeData.p),
        amount: parseFloat(tradeData.sz),
        side: tradeData.side === 'buy' ? 'buy' : 'sell',
        timestamp: Number(tradeData.ts) || Date.now(),
    });
}

module.exports = broadcastTrade;
