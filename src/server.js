const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');
const logger = require('./utils/logger');
const cron = require('node-cron');

async function start() {
  // Verify DB connection before starting
  await testConnection();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });

  // ── Cron: nightly budget check at 9 PM ──────────────────
  cron.schedule('0 21 * * *', async () => {
    logger.info('Running nightly budget alert check...');
    try {
      const { query } = require('./config/db');
      const budgetService = require('./modules/budget/budget.service');
      const now = new Date();
      const month = now.getMonth() + 1;
      const year  = now.getFullYear();

      const { rows: users } = await query('SELECT id FROM users WHERE is_active = TRUE');
      for (const user of users) {
        const budgets = await budgetService.getAll(user.id, { month, year });
        for (const b of budgets) {
          if (!b.alerted && b.progress_pct >= b.alert_at_pct) {
            const notifService = require('./modules/notification/notification.service');
            await notifService.sendBudgetAlert(user.id, b);
            const budgetRepo = require('./modules/budget/budget.repo');
            await budgetRepo.update(b.id, user.id, { alerted: true });
          }
        }
      }
      logger.info('Budget alert check complete');
    } catch (err) {
      logger.error('Cron job error:', err);
    }
  });

  // ── Graceful shutdown ───────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { pool } = require('./config/db');
      await pool.end();
      logger.info('DB pool closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => logger.error('Unhandled rejection:', err));
}

start().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
