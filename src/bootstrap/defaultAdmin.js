const bcrypt = require('bcrypt');
const authRepository = require('../repositories/auth.repository');

const DEFAULT_ADMIN_EMAIL = 'admin@mailinator.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';
const SALT_ROUNDS = 10;

let ensureDefaultAdminPromise;

async function ensureDefaultAdmin() {
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
    throw error;
  });

  return ensureDefaultAdminPromise;
}

module.exports = {
  ensureDefaultAdmin,
  DEFAULT_ADMIN_EMAIL,
};