// config/db.config.js

const mongoose = require('mongoose'); // ⭐ Import Mongoose

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully.');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1); // Stop server if DB fails
    }
};

module.exports = connectDB; // ⭐ Export the function
