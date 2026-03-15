const path = require('path');
const fs = require('fs').promises;
const provider = require('./email.provider');
const { frontendUrl } = require('../../config/app');

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
    console.error('sendAccountActivationEmail error:', err);
  }
}

async function sendResetPasswordEmail(user, resetLink) {
  try {
    const tpl = await loadTemplate('resetPassword');
    const html = render(tpl, { name: user.firstName || user.email, resetLink });
    await provider.sendEmail({ to: user.email, subject: 'Reset your HRMS password', html });
  } catch (err) {
    console.error('sendResetPasswordEmail error:', err);
  }
}

async function sendWelcomeEmail(user) {
  try {
    const tpl = await loadTemplate('welcome');
    const html = render(tpl, { name: user.firstName || user.email });
    await provider.sendEmail({ to: user.email, subject: 'Welcome to HRMS', html });
  } catch (err) {
    console.error('sendWelcomeEmail error:', err);
  }
}

module.exports = {
  sendAccountActivationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
};
