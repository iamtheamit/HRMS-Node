const nodemailer = require('nodemailer');

// Read SMTP configuration from environment variables
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

let transporter;
let usingTestAccount = false;

async function initTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST) {
    // Use provided SMTP configuration
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: SMTP_PORT && Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: SMTP_USER
        ? {
            user: SMTP_USER,
            pass: SMTP_PASS,
          }
        : undefined,
    });
    return transporter;
  }

  // No SMTP configured — create an Ethereal test account for development
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    usingTestAccount = true;
    console.info('No SMTP config found — using Ethereal test account for email.');
    return transporter;
  } catch (err) {
    console.error('Failed to create test email account:', err);
    throw err;
  }
}

async function sendEmail({ to, subject, html, text }) {
  const transport = await initTransporter();
  const from = EMAIL_FROM || SMTP_USER || 'no-reply@example.com';
  const msg = {
    from,
    to,
    subject,
    html,
    text: text || undefined,
  };

  const info = await transport.sendMail(msg);

  if (usingTestAccount) {
    // Log preview URL for Ethereal
    const preview = nodemailer.getTestMessageUrl(info);
    console.info('Ethereal preview URL:', preview);
  }

  return info;
}

module.exports = {
  sendEmail,
  initTransporter,
};
