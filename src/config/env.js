// Environment variables placeholder
module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/finance',
};
