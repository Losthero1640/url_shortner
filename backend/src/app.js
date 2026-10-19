require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const urlRouter = require('./routes/url.route');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register Routes
app.use('/', urlRouter);

// Global 404 Route for unmatched REST routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`   URL Shortener Server Running on Port: ${PORT}`);
  console.log(`   Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`=================================================`);
});

module.exports = app;
