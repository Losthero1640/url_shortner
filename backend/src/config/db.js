const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url-shortener';
    console.log(`Connecting to MongoDB at: ${connString.replace(/:([^:@]+)@/, ':****@')}`);
    
    const conn = await mongoose.connect(connString);
    
    console.log(`MongoDB successfully connected! Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
