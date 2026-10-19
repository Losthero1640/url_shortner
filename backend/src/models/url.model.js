const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  device: {
    type: String,
    default: 'Desktop'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  }
});

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  visits: {
    type: Number,
    required: true,
    default: 0
  },
  visitHistory: [visitSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Url', urlSchema);
