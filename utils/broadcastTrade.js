/**
 * Broadcasts a trade to all connected WebSocket clients
 * @param {Object} io - Socket.IO server instance
 * @param {Object} trade - Trade object to broadcast
 */
function broadcastTrade(io, trade) {
    io.emit('newTrade', {
        symbol: trade.symbol,
        price: trade.price,
        amount: trade.amount,
        side: trade.side,
        timestamp: trade.createdAt || new Date()
    });
}

module.exports = broadcastTrade;
