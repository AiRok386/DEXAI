// models/index.js

const dbConfig = require("../config/db.config.js"); // Import database config
const { Sequelize, DataTypes } = require("sequelize"); // Import Sequelize

// Create Sequelize connection instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    operatorsAliases: false,
    pool: dbConfig.pool
});

// Initialize database object
const db = {};

db.Sequelize = Sequelize; // Save Sequelize package reference
db.sequelize = sequelize; // Save connection instance

// Example: define User Model later
// db.user = require("./user.model.js")(sequelize, DataTypes);

module.exports = db; // Export database object
