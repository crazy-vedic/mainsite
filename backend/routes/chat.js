const express = require('express');
const { loadContent } = require('../lib/contentStore');
const { resolveChatResponse } = require('../lib/resolveChatResponse');
const { chatLimiter } = require('../lib/chatRateLimit');

const router = express.Router();
const MAX_HISTORY_TURNS = 5;

function writeSse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function isAbortError(err) {
  return err?.name === 'AbortError' || err?.code === 'ABORT_ERR';
}

function listenForClientDisconnect(req, res, onDisconnect) {
  const handleDisconnect = () => {
    if (!res.writableFinished) {
      onDisconnect();
    }
  };

  req.on('close', handleDisconnect);
  req.on('aborted', handleDisconnect);

  return () => {
    req.off('close', handleDisconnect);
    req.off('aborted', handleDisconnect);
  };
}

router.post('/', chatLimiter, async (req, res) => {
  const abortController = new AbortController();
  const stopListening = listenForClientDisconnect(req, res, () => {
    abortController.abort();
  });

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
    const trimmedMessage = message.trim();

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const onDelta = (delta) => {
      if (abortController.signal.aborted || res.writableEnded) return;

      try {
        writeSse(res, { delta });
      } catch {
        abortController.abort();
      }
    };

    const result = await resolveChatResponse({
      message: trimmedMessage,
      content,
      history: trimmedHistory,
      signal: abortController.signal,
      onDelta,
    });

    if (abortController.signal.aborted) {
      return;
    }

    if (!result.reply.trim()) {
      writeSse(res, { error: 'LLM returned an empty response' });
      return res.end();
    }

    writeSse(res, { done: true, reply: result.reply, links: result.links || [] });
    res.end();
  } catch (err) {
    if (isAbortError(err) || abortController.signal.aborted) {
      return;
    }

    console.error('POST /api/chat error:', err.message);

    if (res.headersSent) {
      try {
        writeSse(res, { error: 'Failed to get a response from the assistant.' });
        res.end();
      } catch {
        abortController.abort();
      }
      return;
    }

    res.status(502).json({ error: 'Failed to get a response from the assistant.' });
  } finally {
    stopListening();
  }
});

module.exports = router;
