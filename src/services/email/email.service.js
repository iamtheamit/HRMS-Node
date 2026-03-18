const path = require('path');
const fs = require('fs').promises;
const provider = require('./email.provider');
const { frontendUrl } = require('../../config/app');
const logger = require('../../utils/logger');

const templatesDir = path.join(__dirname, '..', '..', 'templates', 'emails');
const cache = new Map();

async function loadTemplate(name) {
  if (cache.has(name)) return cache.get(name);
  const file = path.join(templatesDir, `${name}.html`);
  const content = await fs.readFile(file, 'utf8');
  cache.set(name, content);
  return content;
}

function render(template, vars = {}) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (m, key) => {
    const val = vars[key];
    return val === undefined || val === null ? '' : String(val);
  });
}

async function sendAccountActivationEmail(user, activationLink, temporaryPassword) {
  try {
    const tpl = await loadTemplate('accountActivation');
    const temporaryPasswordSection = temporaryPassword
      ? `<p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
         <p>Please sign in with this password and update it after your first login.</p>`
      : '';

    const html = render(tpl, {
      name: user.firstName || user.email,
      activationLink,
      loginLink: `${String(frontendUrl || '').replace(/\/$/, '')}/login`,
      temporaryPasswordSection,
    });
    await provider.sendEmail({ to: user.email, subject: 'Activate your HRMS account', html });
  } catch (err) {
    logger.error('[EMAIL] sendAccountActivationEmail failed', err);
    throw err;
  }
}

async function sendResetPasswordEmail(user, resetLink) {
  try {
    const tpl = await loadTemplate('resetPassword');
    const html = render(tpl, { name: user.firstName || user.email, resetLink });
    await provider.sendEmail({ to: user.email, subject: 'Reset your HRMS password', html });
  } catch (err) {
    logger.error('[EMAIL] sendResetPasswordEmail failed', err);
    throw err;
  }
}

async function sendWelcomeEmail(user) {
  try {
    const tpl = await loadTemplate('welcome');
    const html = render(tpl, { name: user.firstName || user.email });
    await provider.sendEmail({ to: user.email, subject: 'Welcome to HRMS', html });
  } catch (err) {
    logger.error('[EMAIL] sendWelcomeEmail failed', err);
    throw err;
  }
}

async function sendPasswordChangeOtpEmail(user, otp) {
  try {
    const safeName = user.firstName || user.email;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 12px;">Password Change Verification</h2>
        <p>Hello ${safeName},</p>
        <p>Use the OTP below to verify your password change request. This code expires in 10 minutes.</p>
        <div style="margin:16px 0;padding:14px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:24px;font-weight:700;letter-spacing:4px;display:inline-block;">
          ${otp}
        </div>
        <p>If you did not request this change, please ignore this email and secure your account.</p>
      </div>
    `;

    await provider.sendEmail({
      to: user.email,
      subject: 'Your HRMS password change OTP',
      html,
    });
  } catch (err) {
    logger.error('[EMAIL] sendPasswordChangeOtpEmail failed', err);
    throw err;
  }
}

module.exports = {
  sendAccountActivationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendPasswordChangeOtpEmail,
};
