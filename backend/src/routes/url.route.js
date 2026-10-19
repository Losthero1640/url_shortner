const express = require('express');
const router = express.Router();
const {
  handleGenerateShortURL,
  handleRedirect,
  handleGetAnalytics
} = require('../controllers/url.controller');

// URL Shortening Endpoint
router.post('/url', handleGenerateShortURL);
router.post('/URL', handleGenerateShortURL);

// Analytics Endpoint
router.get('/url/analytics/:id', handleGetAnalytics);
router.get('/URL/analytics/:id', handleGetAnalytics);

// Redirection Endpoint
router.get('/:id', handleRedirect);

module.exports = router;
