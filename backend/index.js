const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
require('dotenv').config();

const logger = require('./src/lib/logger');
const authRoutes = require('./src/routes/auth');
const portfolioRoutes = require('./src/routes/portfolio');
const settingsRoutes = require('./src/routes/settings');
const marketsRoutes = require('./src/routes/markets');
const { ipLimiter } = require('./src/middleware/rateLimits');
const sanitizeBody = require('./src/middleware/sanitize');

const app = express();

if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development' });
}

app.set('trust proxy', 1);
app.use(pinoHttp({ logger }));
app.use(helmet({
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 15552000, includeSubDomains: true } : false,
}));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(ipLimiter);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(sanitizeBody);

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/markets', marketsRoutes);

app.get('/health', async (req, res) => {
  try {
    const prisma = require('./src/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', timestamp: new Date().toISOString() });
  }
});

app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  if (process.env.SENTRY_DSN) {
    require('@sentry/node').captureException(err);
  }
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});
