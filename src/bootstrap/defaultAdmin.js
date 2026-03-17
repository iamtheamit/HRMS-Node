const bcrypt = require('bcrypt');
const authRepository = require('../repositories/auth.repository');

const DEFAULT_ADMIN_EMAIL = 'admin@mailinator.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';
const SALT_ROUNDS = 10;

let ensureDefaultAdminPromise;

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;

  return fallback;
};

// Determines whether to bootstrap default admin account on startup
// In production, disabled by default to avoid Prisma connection pool exhaustion
// Can be explicitly enabled via ENABLE_DEFAULT_ADMIN_BOOTSTRAP env variable
const shouldBootstrapDefaultAdmin = () => {
  if (process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP !== undefined) {
    return parseBoolean(process.env.ENABLE_DEFAULT_ADMIN_BOOTSTRAP, false);
  }

  // Only auto-bootstrap in development environments
  return process.env.NODE_ENV !== 'production';
};

const isPoolTimeoutError = (error) => String(error?.message || '').includes('Timed out fetching a new connection from the connection pool');

async function ensureDefaultAdmin() {
  if (!shouldBootstrapDefaultAdmin()) {
    return null;
  }

  if (ensureDefaultAdminPromise) {
    return ensureDefaultAdminPromise;
  }

  ensureDefaultAdminPromise = (async () => {
    const existingAdmin = await authRepository.findUserByEmail(DEFAULT_ADMIN_EMAIL);
    if (existingAdmin) {
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

    const createdAdmin = await authRepository.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'Admin',
      isActive: true,
      activationToken: null,
    });

    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);

    return createdAdmin;
  })().catch((error) => {
    ensureDefaultAdminPromise = undefined;

    // Handle Prisma connection pool timeout gracefully in production
    // Vercel serverless functions have limited DB connections (default: 5)
    // During cold starts, the pool can be exhausted. Skip bootstrap rather than fail startup.
    if (process.env.NODE_ENV === 'production' && isPoolTimeoutError(error)) {
      console.warn('Skipping default admin bootstrap due to Prisma connection pool timeout.');
      return null;
    }

    // For other errors, fail startup loudly to alert developers
    throw error;
  });

  return ensureDefaultAdminPromise;
}

module.exports = {
  ensureDefaultAdmin,
  DEFAULT_ADMIN_EMAIL,
};