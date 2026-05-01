// email.provider.js
const sgMail = require('@sendgrid/mail');
const env = require('../../config/env');
const logger = require('../../utils/logger');

if (env.sendgrid.apiKey && !env.sendgrid.apiKey.includes('your_')) {
  sgMail.setApiKey(env.sendgrid.apiKey);
}

const send = async ({ to, subject, html, text }) => {
  const apiKey = env.sendgrid.apiKey;

  if (!apiKey || apiKey.includes('your_')) {
    logger.info(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return; // Silently skip in dev
  }

  const msg = {
    to,
    from: { email: env.sendgrid.fromEmail, name: env.sendgrid.fromName },
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  };

  try {
    await sgMail.send(msg);
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error('SendGrid error:', err.response?.body?.errors || err.message);
    throw err;
  }
};

module.exports = { send };