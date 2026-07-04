const express = require('express');
const rateLimit = require('express-rate-limit');
const { loadContent } = require('../lib/contentStore');
const { buildSystemPrompt } = require('../lib/buildSystemPrompt');
const { streamLLM } = require('../lib/llmClient');

const router = express.Router();
const MAX_HISTORY_TURNS = 5;

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { error: 'Rate limit exceeded. Please wait a minute before sending another message.' },
});

function writeSse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

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

    const trimmedHistory = (history || []).slice(-MAX_HISTORY_TURNS).filter(
      (turn) => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string',
    );

    const content = await loadContent();
    const systemPrompt = buildSystemPrompt(content);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let reply = '';

    await streamLLM({
      systemPrompt,
      history: trimmedHistory,
      message: message.trim(),
      onDelta: (delta) => {
        reply += delta;
        writeSse(res, { delta });
      },
    });

    if (!reply.trim()) {
      writeSse(res, { error: 'LLM returned an empty response' });
      return res.end();
    }

    writeSse(res, { done: true, reply: reply.trim() });
    res.end();
  } catch (err) {
    console.error('POST /api/chat error:', err.message);

    if (res.headersSent) {
      writeSse(res, { error: 'Failed to get a response from the assistant.' });
      return res.end();
    }

    res.status(502).json({ error: 'Failed to get a response from the assistant.' });
  }
});

module.exports = router;
