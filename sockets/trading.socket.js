// trading.socket.js

const OrderBook = require('../utils/orderbook.util'); // optional: use your own order book system
const { broadcastPriceUpdate, broadcastDepthUpdate } = require('../utils/websocket.util');

// Simulate broadcasting
broadcastPriceUpdate(io, { pair: 'BTC/USDT', price: 27500.43, timestamp: Date.now() });

// Store active sockets for broadcasting
const connectedUsers = new Set();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New trader connected:', socket.id);
        connectedUsers.add(socket);

        // Listen for new order
        socket.on('new_order', (order) => {
            console.log('📥 New order:', order);

            // Here you’d validate and store the order in your DB
            // Optionally: match the order with an orderbook
            const updatedPrice = simulatePriceChange(order);

            // Broadcast new price to all users
            broadcastPriceUpdate(io, updatedPrice);
        });

        // Listen for cancel order
        socket.on('cancel_order', (orderId) => {
            console.log('❌ Cancel order:', orderId);
            // TODO: Remove from DB/orderbook and notify client
        });

        // Simulate depth updates
        socket.on('get_depth', (pair) => {
            const fakeDepth = generateFakeDepth(pair);
            socket.emit('depth_update', fakeDepth);
        });

        socket.on('disconnect', () => {
            console.log('❎ Trader disconnected:', socket.id);
            connectedUsers.delete(socket);
        });
    });
};

// Simulate price change logic (replace with real engine)
function simulatePriceChange(order) {
    const basePrice = 100 + Math.random() * 10;
    return {
        pair: order.pair || 'BTC/USDT',
        price: parseFloat(basePrice.toFixed(2)),
        timestamp: Date.now(),
    };
}

// Mock market depth generator
function generateFakeDepth(pair) {
    const bids = [], asks = [];
    const base = 100;

    for (let i = 0; i < 10; i++) {
        bids.push([parseFloat((base - i * 0.5).toFixed(2)), (10 + i)]);
        asks.push([parseFloat((base + i * 0.5).toFixed(2)), (10 + i)]);
    }

    return { pair, bids, asks };
}
