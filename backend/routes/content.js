const express = require('express');
const { loadContent } = require('../lib/contentStore');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const content = await loadContent();
    res.json(content);
  } catch (err) {
    console.error('GET /api/content error:', err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

module.exports = router;
