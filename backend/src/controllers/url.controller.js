const crypto = require('crypto');
const useragent = require('useragent');
const Url = require('../models/url.model');

// Cryptographically secure short ID generator
const generateShortId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

// POST /url - Create a shortened URL
const handleGenerateShortURL = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let targetUrl = originalUrl.trim();
    
    // Automatically prepend protocol if missing
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Please provide a valid URL' });
    }

    // Check if the URL is already shortened in the system
    let existingUrl = await Url.findOne({ originalUrl: targetUrl });
    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

    if (existingUrl) {
      return res.json({
        shortId: existingUrl.shortId,
        originalUrl: existingUrl.originalUrl,
        shortenedUrl: `${baseUrl}/${existingUrl.shortId}`
      });
    }

    // Generate unique short ID
    let shortId;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 5) {
      shortId = generateShortId(8);
      const collision = await Url.findOne({ shortId });
      if (!collision) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique short URL' });
    }

    // Save to Database
    const newUrl = new Url({
      shortId,
      originalUrl: targetUrl
    });
    await newUrl.save();

    return res.status(201).json({
      shortId,
      originalUrl: targetUrl,
      shortenedUrl: `${baseUrl}/${shortId}`
    });
  } catch (error) {
    console.error('Error generating short URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /:shortId - Redirect to original URL and log analytics
const handleRedirect = async (req, res) => {
  try {
    const { id } = req.params;
    const urlEntry = await Url.findOne({ shortId: id });

    if (!urlEntry) {
      // Serve a visually pleasing 404 page directly
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found</title>
          <style>
            body {
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #0f172a;
              color: #f8fafc;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .container {
              background: rgba(30, 41, 59, 0.7);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              padding: 3rem;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              max-width: 400px;
            }
            h1 {
              font-size: 5rem;
              margin: 0;
              background: linear-gradient(135deg, #14b8a6, #06b6d4);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              color: #94a3b8;
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .btn {
              display: inline-block;
              background: linear-gradient(135deg, #14b8a6, #0d9488);
              color: #ffffff;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 500;
              transition: all 0.3s ease;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <h2>Oops! Link not found</h2>
            <p>The shortened URL you are trying to access does not exist or has expired.</p>
            <a href="/" class="btn">Create Your Own Short Link</a>
          </div>
        </body>
        </html>
      `);
    }

    // Gather client info
    const uaString = req.headers['user-agent'] || '';
    const agent = useragent.parse(uaString);
    
    // Simple but reliable device type parsing
    let device = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(uaString)) {
      device = 'Tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(uaString)) {
      device = 'Mobile';
    }

    const browser = agent.family || 'Unknown';
    const os = agent.os.family || 'Unknown';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // Log the visit to history
    urlEntry.visits += 1;
    urlEntry.visitHistory.push({
      ipAddress,
      userAgent: uaString,
      device,
      browser,
      os,
      timestamp: new Date()
    });

    await urlEntry.save();

    // Redirect to the original URL
    return res.redirect(302, urlEntry.originalUrl);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /url/analytics/:id - Fetch analytics details for a URL
const handleGetAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const urlEntry = await Url.findOne({ shortId: id });

    if (!urlEntry) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Aggregate statistics
    const deviceStats = { Mobile: 0, Tablet: 0, Desktop: 0 };
    const browserStats = {};
    const osStats = {};

    urlEntry.visitHistory.forEach((visit) => {
      const dev = visit.device || 'Desktop';
      deviceStats[dev] = (deviceStats[dev] || 0) + 1;

      const brow = visit.browser || 'Unknown';
      browserStats[brow] = (browserStats[brow] || 0) + 1;

      const opsys = visit.os || 'Unknown';
      osStats[opsys] = (osStats[opsys] || 0) + 1;
    });

    return res.json({
      shortId: urlEntry.shortId,
      originalUrl: urlEntry.originalUrl,
      visits: urlEntry.visits,
      deviceStats,
      browserStats,
      osStats,
      history: urlEntry.visitHistory.slice(-10).reverse() // Return last 10 visits, newest first
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleGenerateShortURL,
  handleRedirect,
  handleGetAnalytics
};
