// config/db.js

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log success message if connected
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    // Log error message if connection fails
    console.error('❌ DB Connection Error:', err.message);

    // Exit the process in case of connection failure
    process.exit(1);
  }
};

// Export the connectDB function for use in other parts of the app
module.exports = connectDB;
