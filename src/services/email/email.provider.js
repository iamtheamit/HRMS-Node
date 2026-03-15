const nodemailer = require('nodemailer');

// Read SMTP configuration from environment variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST || 'localhost',
  port: SMTP_PORT ? Number(SMTP_PORT) : 587,
  secure: false,
  auth: SMTP_USER
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
});

async function sendEmail({ to, subject, html, text }) {
  const from = EMAIL_FROM || SMTP_USER || 'no-reply@example.com';
  const msg = {
    from,
    to,
    subject,
    html,
    text: text || undefined,
  };
  return transporter.sendMail(msg);
}

module.exports = {
  sendEmail,
  transporter,
};
