const express = require('express');
const rateLimit = require('express-rate-limit');
const { loadContent } = require('../lib/contentStore');
const { buildSystemPrompt } = require('../lib/buildSystemPrompt');
const { askLLM } = require('../lib/llmClient');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { error: 'Rate limit exceeded. Please wait a minute before sending another message.' },
});

router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message, history } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message must be a non-empty string' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'message must be 2000 characters or fewer' });
    }

    if (history !== undefined && !Array.isArray(history)) {
      return res.status(400).json({ error: 'history must be an array' });
    }

    const trimmedHistory = (history || []).slice(-20).filter(
      (turn) => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string',
    );

    const content = await loadContent();
    const systemPrompt = buildSystemPrompt(content);
    const { reply } = await askLLM({
      systemPrompt,
      history: trimmedHistory,
      message: message.trim(),
    });

    res.json({ reply });
  } catch (err) {
    console.error('POST /api/chat error:', err.message);
    res.status(502).json({ error: 'Failed to get a response from the assistant.' });
  }
});

module.exports = router;
