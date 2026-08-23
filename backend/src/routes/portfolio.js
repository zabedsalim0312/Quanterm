const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authMiddleware');
const { userLimiter } = require('../middleware/rateLimits');

const router = express.Router();
router.use(authenticate);
router.use(userLimiter);

router.get('/', async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: req.user.userId },
      include: { assets: true },
    });
    res.json(portfolios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/connect', [
  body('brokerName').trim().isLength({ min: 2, max: 40 }).escape(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { brokerName } = req.body;
    const newPortfolio = await prisma.portfolio.create({
      data: {
        userId: req.user.userId,
        brokerName,
        totalValue: Math.floor(Math.random() * 100000) + 5000,
        assets: {
          create: [
            { symbol: 'AAPL', name: 'Apple Inc.', quantity: 15, currentPrice: 175.50 },
            { symbol: 'TSLA', name: 'Tesla Inc.', quantity: 10, currentPrice: 220.10 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 8, currentPrice: 330.00 },
          ],
        },
      },
      include: { assets: true },
    });

    res.status(201).json({
      ...newPortfolio,
      notice: 'Broker sync is a placeholder until official Kite/Groww/Upstox developer access is approved.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
