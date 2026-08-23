const express = require('express');
const { body, query, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { authenticator } = require('otplib');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { sendMail } = require('../lib/mailer');
const {
  signAccessToken,
  signTempToken,
  verifyToken,
  randomToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../lib/tokens');
const authenticate = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimits');

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    timezone: user.timezone,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    settings: user.settings || {},
  };
}

async function issueSession(res, user) {
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = randomToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: hashToken(refreshToken) },
  });
  setAuthCookies(res, accessToken, refreshToken);
}

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 1, max: 80 }).escape(),
], async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyTokenValue = randomToken();
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerifyToken: hashToken(verifyTokenValue),
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        settings: {
          notifications: {
            priceAlerts: true,
            portfolioDaily: true,
            newsDigest: false,
            tradeConfirm: true,
            riskWarnings: true,
            weeklyReport: false,
          },
          appearance: {
            theme: 'dark',
            accent: '#3B82F6',
            compactMode: false,
            animations: true,
          },
        },
      },
    });

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verifyTokenValue}`;
    await sendMail({
      to: email,
      subject: 'Verify your Quanterm email',
      html: `<p>Hi ${name},</p><p>Confirm your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    await issueSession(res, user);
    logger.info({ userId: user.id }, 'User registered');
    res.status(201).json({ user: publicUser(user), message: 'Check your email to verify your account.' });
  } catch (err) {
    logger.error({ err }, 'Register failed');
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const { email, password, totp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.twoFactorEnabled) {
      if (!totp) {
        const challenge = signTempToken({ userId: user.id, purpose: '2fa' });
        return res.json({ requires2fa: true, challenge });
      }
      if (!authenticator.check(String(totp), user.twoFactorSecret)) {
        return res.status(400).json({ message: 'Invalid authenticator code' });
      }
    }

    await issueSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    logger.error({ err }, 'Login failed');
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/2fa/verify', authLimiter, [
  body('challenge').notEmpty(),
  body('totp').isLength({ min: 6, max: 8 }),
], async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const decoded = verifyToken(req.body.challenge);
    if (decoded.purpose !== '2fa') return res.status(400).json({ message: 'Invalid challenge' });
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user?.twoFactorEnabled || !authenticator.check(String(req.body.totp), user.twoFactorSecret)) {
      return res.status(400).json({ message: 'Invalid authenticator code' });
    }
    await issueSession(res, user);
    res.json({ user: publicUser(user) });
  } catch {
    res.status(400).json({ message: 'Invalid or expired challenge' });
  }
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const hash = hashToken(token);
    const user = await prisma.user.findFirst({ where: { refreshTokenHash: hash } });
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    await issueSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    logger.error({ err }, 'Refresh failed');
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await prisma.user.updateMany({
      where: { refreshTokenHash: hashToken(token) },
      data: { refreshTokenHash: null },
    });
  }
  clearAuthCookies(res);
  res.json({ message: 'Logged out' });
});

router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(401).json({ message: 'User not found' });
  res.json({ user: publicUser(user) });
});

router.post('/resend-verification', authLimiter, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return res.json({ message: 'If that email exists, a verification link has been sent.' });
  if (user.emailVerified) return res.status(400).json({ message: 'Email is already verified.' });

  const verifyTokenValue = randomToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: hashToken(verifyTokenValue),
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verifyTokenValue}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your Quanterm email',
    html: `<p>Hi ${user.name},</p><p>Confirm your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
  res.json({ message: 'If that email exists, a verification link has been sent.' });
});

router.get('/verify-email', [query('token').notEmpty()], async (req, res) => {
  if (handleValidation(req, res)) return;
  const hashed = hashToken(req.query.token);
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: hashed, emailVerifyExpires: { gt: new Date() } },
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
  });
  res.json({ message: 'Email verified' });
});

router.post('/forgot-password', authLimiter, [body('email').isEmail().normalizeEmail()], async (req, res) => {
  if (handleValidation(req, res)) return;
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user) {
    const resetToken = randomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashToken(resetToken),
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your Quanterm password',
      html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
    });
  }
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

router.post('/reset-password', authLimiter, [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  if (handleValidation(req, res)) return;
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashToken(req.body.token),
      passwordResetExpires: { gt: new Date() },
    },
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(req.body.password, 12),
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshTokenHash: null,
    },
  });
  clearAuthCookies(res);
  res.json({ message: 'Password updated. Please sign in.' });
});

router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res) => {
  if (handleValidation(req, res)) return;
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  const ok = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(req.body.newPassword, 12) },
  });
  res.json({ message: 'Password updated' });
});

router.post('/2fa/setup', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } });
  const otpauth = authenticator.keyuri(user.email, 'Quanterm', secret);
  res.json({ secret, otpauth });
});

router.post('/2fa/enable', authenticate, [body('totp').isLength({ min: 6, max: 8 })], async (req, res) => {
  if (handleValidation(req, res)) return;
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user.twoFactorSecret || !authenticator.check(String(req.body.totp), user.twoFactorSecret)) {
    return res.status(400).json({ message: 'Invalid authenticator code' });
  }
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  res.json({ twoFactorEnabled: true });
});

router.post('/2fa/disable', authenticate, [
  body('password').notEmpty(),
  body('totp').isLength({ min: 6, max: 8 }),
], async (req, res) => {
  if (handleValidation(req, res)) return;
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid password' });
  if (!authenticator.check(String(req.body.totp), user.twoFactorSecret)) {
    return res.status(400).json({ message: 'Invalid authenticator code' });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
  res.json({ twoFactorEnabled: false });
});

module.exports = router;
