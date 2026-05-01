const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const env = require('./config/env');
const passport = require('./config/oauth');
const { errorHandler } = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const logger = require('./utils/logger');

const app = express();

// ── Security & parsing ──────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.appUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev', { stream: { write: msg => logger.info(msg.trim()) } }));

// ── Session (required for Passport OAuth flow only) ─────
app.use(session({
  secret: env.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: env.isProduction, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

// ── Static files ────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',          require('./modules/auth/auth.routes'));
app.use('/api/categories',    authenticate, require('./modules/category/category.routes'));
app.use('/api/transactions',  authenticate, require('./modules/transaction/transaction.routes'));
app.use('/api/budgets',       authenticate, require('./modules/budget/budget.routes'));
app.use('/api/reports',       authenticate, require('./modules/report/report.routes'));
app.use('/api/dashboard',     authenticate, require('./modules/dashboard/dashboard.routes'));
app.use('/api/receipts',      authenticate, require('./modules/upload/upload.routes'));
app.use('/api/notifications', authenticate, require('./modules/notification/notification.routes'));
app.use('/api/currencies',    authenticate, require('./modules/currency/currency.routes'));

// ── Health check ────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Catch-all: serve frontend ────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Route not found' });
  }
});

// ── Global error handler ─────────────────────────────────
app.use(errorHandler);

module.exports = app;