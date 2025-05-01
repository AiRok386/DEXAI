// websocket.util.js

/**
 * Broadcast updated price to all connected clients via WebSocket.
 * @param {Object} io - The socket.io server instance.
 * @param {Object} data - Contains price, pair, timestamp etc.
 */
function broadcastPriceUpdate(io, data) {
    io.emit('price_update', data); // send to all connected sockets
    console.log(`📡 Price update broadcasted:`, data);
}

/**
 * Broadcast updated order book depth (bids/asks).
 * @param {Object} io - The socket.io server instance.
 * @param {String} pair - Trading pair like BTC/USDT
 * @param {Object} depth - Depth object { bids, asks }
 */
function broadcastDepthUpdate(io, pair, depth) {
    io.emit('depth_update', {
        pair,
        bids: depth.bids,
        asks: depth.asks
    });
    console.log(`📊 Depth update broadcasted for ${pair}`);
}

/**
 * Emit a custom message to a specific socket by ID
 * @param {Object} io - The socket.io server instance.
 * @param {String} socketId - Target socket ID
 * @param {String} event - Custom event name
 * @param {Object} payload - Data to send
 */
function emitToSocket(io, socketId, event, payload) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
        socket.emit(event, payload);
        console.log(`📬 Message sent to ${socketId} on event "${event}"`);
    }
}

module.exports = {
    broadcastPriceUpdate,
    broadcastDepthUpdate,
    emitToSocket,
};
