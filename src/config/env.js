require('dotenv').config();

const required = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
  'JWT_SECRET', 'SESSION_SECRET'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  session: {
    secret: process.env.SESSION_SECRET,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@financetracker.com',
    fromName: process.env.FROM_NAME || 'Finance Tracker',
  },

  currency: {
    apiKey: process.env.EXCHANGE_RATE_API_KEY,
    baseUrl: process.env.EXCHANGE_RATE_BASE_URL || 'https://v6.exchangerate-api.com/v6',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB) || 5,
  },

  appUrl: process.env.APP_URL || 'http://localhost:3000',
};
