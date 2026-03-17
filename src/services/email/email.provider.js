const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

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
  if (transporter) {
    logger.debug('[EMAIL] Transporter already initialized, returning cached instance');
    return transporter;
  }

  if (SMTP_HOST) {
    // Use provided SMTP configuration
    logger.info('[EMAIL] Initializing SMTP transporter', {
      host: SMTP_HOST,
      port: SMTP_PORT || 587,
      secure: SMTP_PORT && Number(SMTP_PORT) === 465,
      hasAuth: !!SMTP_USER,
    });

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

    try {
      await transporter.verify();
      logger.info('[EMAIL] SMTP transporter verified successfully');
    } catch (verifyError) {
      logger.error('[EMAIL] SMTP transporter verification failed', verifyError);
      throw verifyError;
    }

    logger.info('[EMAIL] SMTP transporter initialized successfully');
    return transporter;
  }

  // No SMTP configured — create an Ethereal test account for development
  logger.warn('[EMAIL] No SMTP configuration found, using Ethereal test account for development');
  try {
    const testAccount = await nodemailer.createTestAccount();
    logger.info('[EMAIL] Ethereal test account created', {
      email: testAccount.user,
      provider: 'Ethereal Test Account',
    });

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
    return transporter;
  } catch (err) {
    logger.error('[EMAIL] Failed to create Ethereal test email account', err);
    throw err;
  }
}

async function sendEmail({ to, subject, html, text }) {
  const startTime = Date.now();
  try {
    const transport = await initTransporter();
    const from = EMAIL_FROM || SMTP_USER || 'no-reply@example.com';
    
    logger.info('[EMAIL] Sending email', {
      to,
      subject: subject.substring(0, 50), // Log first 50 chars
      from,
      hasHtml: !!html,
      hasText: !!text,
    });

    const msg = {
      from,
      to,
      subject,
      html,
      text: text || undefined,
    };

    const info = await transport.sendMail(msg);
    const duration = Date.now() - startTime;

    logger.info('[EMAIL] Email sent successfully', {
      to,
      messageId: info.messageId,
      response: info.response?.substring(0, 100),
      durationMs: duration,
    });

    if (usingTestAccount) {
      // Log preview URL for Ethereal
      const preview = nodemailer.getTestMessageUrl(info);
      logger.info('[EMAIL] Ethereal preview URL (development only)', {
        url: preview,
      });
    }

    return info;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[EMAIL] Failed to send email', error);
    logger.error(`[EMAIL] Email send failed after ${duration}ms`, {
      to,
      subject,
      errorType: error.name,
    });
    throw error;
  }
}

module.exports = {
  sendEmail,
  initTransporter,
};
