const express = require('express');
const cache = require('../lib/cache');
const logger = require('../lib/logger');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

const FALLBACK = [
  { symbol: 'AAPL', price: 175.5, changePct: 0.42, source: 'fallback' },
  { symbol: 'MSFT', price: 330.0, changePct: 0.18, source: 'fallback' },
  { symbol: 'GOOGL', price: 141.2, changePct: -0.31, source: 'fallback' },
  { symbol: 'AMZN', price: 178.4, changePct: 0.55, source: 'fallback' },
];

async function fetchQuote(symbol) {
  const cached = cache.get(`quote:${symbol}`);
  if (cached) return cached;

  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return null;

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  const q = data['Global Quote'];
  if (!q || !q['05. price']) return null;

  const quote = {
    symbol,
    price: Number(q['05. price']),
    changePct: Number(String(q['10. change percent'] || '0').replace('%', '')),
    source: 'alpha_vantage',
  };
  cache.set(`quote:${symbol}`, quote, 5 * 60 * 1000);
  return quote;
}

router.get('/quotes', async (req, res) => {
  const symbols = String(req.query.symbols || 'AAPL,MSFT,GOOGL,AMZN')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 8);

  try {
    const quotes = [];
    for (const symbol of symbols) {
      const quote = await fetchQuote(symbol);
      if (quote) quotes.push(quote);
    }
    if (!quotes.length) {
      return res.json({ quotes: FALLBACK, notice: 'Using fallback quotes. Set ALPHA_VANTAGE_API_KEY for live data.' });
    }
    res.json({ quotes });
  } catch (err) {
    logger.error({ err }, 'Market quotes failed');
    res.json({ quotes: FALLBACK, notice: 'Market data provider unavailable; showing fallback quotes.' });
  }
});

module.exports = router;
