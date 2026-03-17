const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
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
    logger.debug('[BOOTSTRAP] Default admin bootstrap disabled (set ENABLE_DEFAULT_ADMIN_BOOTSTRAP=true to enable in production)');
    return null;
  }

  if (ensureDefaultAdminPromise) {
    return ensureDefaultAdminPromise;
  }

  logger.info('[BOOTSTRAP] Starting default admin bootstrap process...');

  ensureDefaultAdminPromise = (async () => {
    try {
      logger.debug('[BOOTSTRAP] Checking if default admin already exists', { email: DEFAULT_ADMIN_EMAIL });
      const existingAdmin = await authRepository.findUserByEmail(DEFAULT_ADMIN_EMAIL);
      
      if (existingAdmin) {
        logger.info('[BOOTSTRAP] Default admin already exists, skipping creation', {
          email: DEFAULT_ADMIN_EMAIL,
          userId: existingAdmin.id,
        });
        return existingAdmin;
      }

      logger.info('[BOOTSTRAP] Default admin not found, creating new admin...');
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

      logger.info('[BOOTSTRAP] Default admin created successfully', {
        email: DEFAULT_ADMIN_EMAIL,
        userId: createdAdmin.id,
      });

      return createdAdmin;
    } catch (error) {
      ensureDefaultAdminPromise = undefined;

      // Handle Prisma connection pool timeout gracefully in production
      // Vercel serverless functions have limited DB connections (default: 5)
      // During cold starts, the pool can be exhausted. Skip bootstrap rather than fail startup.
      if (process.env.NODE_ENV === 'production' && isPoolTimeoutError(error)) {
        logger.warn('[BOOTSTRAP] Skipping default admin bootstrap due to Prisma connection pool timeout (connection exhausted)', {
          errorMessage: error.message,
          recommendation: 'Verify Prisma connection pool settings or CORS configuration during cold starts',
        });
        return null;
      }

      // For other errors, fail startup loudly to alert developers
      logger.error('[BOOTSTRAP] Default admin bootstrap failed with unexpected error', error);
      throw error;
    }
  })();

  return ensureDefaultAdminPromise;
}

module.exports = {
  ensureDefaultAdmin,
  DEFAULT_ADMIN_EMAIL,
};