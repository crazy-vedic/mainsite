const mongoose = require('mongoose');
require('dotenv').config();

// Fallback to a local database if MONGO_URL is missing from .env
const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/studentDBMSDB';

console.log(`Attempting connection to MongoDB...`);

mongoose.connect(mongoURL)
  .then(() => {
    console.log(`Connected successfully to database: studentDBMSDB`);
  })
  .catch((err) => {
    console.error(`💥 MongoDB connection error:`, err.message);
    console.log(`Please ensure your local MongoDB service is running with 'sudo systemctl start mongodb'`);
  });

const connection = mongoose.connection;
module.exports = connection;
