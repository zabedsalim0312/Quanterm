const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL_MS = Number(process.env.REFRESH_TOKEN_TTL_MS || 7 * 24 * 60 * 60 * 1000);

function requireSecret() {
  if (!JWT_SECRET || JWT_SECRET === 'supersecretjwtkey_for_beta') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong unique value in production');
    }
  }
  return JWT_SECRET || 'dev-only-jwt-secret';
}

function signAccessToken(payload) {
  return jwt.sign(payload, requireSecret(), { expiresIn: ACCESS_TTL });
}

function signTempToken(payload, expiresIn = '5m') {
  return jwt.sign(payload, requireSecret(), { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, requireSecret());
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieOptions(maxAgeMs) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie('refresh_token', refreshToken, cookieOptions(REFRESH_TTL_MS));
}

function clearAuthCookies(res) {
  const base = cookieOptions(0);
  res.clearCookie('access_token', base);
  res.clearCookie('refresh_token', base);
}

module.exports = {
  signAccessToken,
  signTempToken,
  verifyToken,
  randomToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TTL_MS,
};
