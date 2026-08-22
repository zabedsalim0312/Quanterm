const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get user portfolios
router.get('/', authenticate, async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: req.user.userId },
      include: { assets: true }
    });
    res.json(portfolios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock connect a broker
router.post('/connect', authenticate, async (req, res) => {
  try {
    const { brokerName } = req.body;
    
    // Mock data based on broker
    const newPortfolio = await prisma.portfolio.create({
      data: {
        userId: req.user.userId,
        brokerName,
        totalValue: Math.floor(Math.random() * 100000) + 5000,
        assets: {
          create: [
            { symbol: 'AAPL', name: 'Apple Inc.', quantity: 15, currentPrice: 175.50 },
            { symbol: 'TSLA', name: 'Tesla Inc.', quantity: 10, currentPrice: 220.10 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 8, currentPrice: 330.00 }
          ]
        }
      },
      include: { assets: true }
    });

    res.status(201).json(newPortfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
