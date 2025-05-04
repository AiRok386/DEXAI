// utils/historyStorage.js

const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient('mongodb://localhost:27017');
const dbName = 'cryptoExchange';
let db;

// Connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db(dbName);
    console.log('MongoDB connected for history storage');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

// Save trade history to MongoDB
async function saveTradeHistory(tradeData) {
  try {
    const collection = db.collection('tradeHistory');
    await collection.insertOne(tradeData);
  } catch (err) {
    console.error('Error saving trade history:', err.message);
  }
}

// Save order book (depth) history to MongoDB
async function saveDepthHistory(depthData) {
  try {
    const collection = db.collection('depthHistory');
    await collection.insertOne(depthData);
  } catch (err) {
    console.error('Error saving depth history:', err.message);
  }
}

// Connect to MongoDB
connectMongoDB();

module.exports = { saveTradeHistory, saveDepthHistory };
