const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    return transporter;
  }

  transporter = {
    sendMail: async (opts) => {
      logger.info({ to: opts.to, subject: opts.subject, html: opts.html }, 'Email (dev console transport)');
      return { messageId: 'dev-console' };
    },
  };
  return transporter;
}

async function sendMail({ to, subject, html }) {
  const mailer = await getTransporter();
  const from = process.env.MAIL_FROM || 'Quanterm <noreply@localhost>';
  return mailer.sendMail({ from, to, subject, html });
}

module.exports = { sendMail };
