const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

function deepMerge(target, source) {
  const output = { ...(target || {}) };
  if (!source || typeof source !== 'object') return output;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

router.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json({
    name: user.name,
    email: user.email,
    timezone: user.timezone,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    settings: user.settings || {},
  });
});

router.put('/', [
  body('name').optional().trim().isLength({ min: 1, max: 80 }).escape(),
  body('timezone').optional().isString().isLength({ max: 64 }),
  body('settings').optional().isObject(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  const data = {};
  if (req.body.name) data.name = req.body.name;
  if (req.body.timezone) data.timezone = req.body.timezone;
  if (req.body.settings) data.settings = deepMerge(user.settings, req.body.settings);

  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data,
  });

  res.json({
    name: updated.name,
    email: updated.email,
    timezone: updated.timezone,
    settings: updated.settings || {},
  });
});

module.exports = router;
