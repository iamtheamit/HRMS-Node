// prisma.js
// This configuration file initializes and exports a singleton Prisma client instance.
// It is responsible for providing a shared database access layer to repositories and other data-access utilities.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;

