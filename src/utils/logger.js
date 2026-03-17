// logger.js
// Centralized logging utility with severity levels and timestamps
// Provides consistent log formatting across the application for debugging and monitoring

const getTimestamp = () => {
  return new Date().toISOString();
};

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const getColorCode = (level) => {
  const colors = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m',  // Green
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m', // Red
  };
  return colors[level] || '';
};

const resetColor = '\x1b[0m';

const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const color = getColorCode(level);
  const prefix = `[${timestamp}] [${level}]`;

  if (data) {
    // For objects, use JSON serialization for easier debugging
    const dataStr =
      typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    return `${color}${prefix} ${message}${resetColor}\n${dataStr}`;
  }

  return `${color}${prefix} ${message}${resetColor}`;
};

const logger = {
  debug: (message, data) => {
    console.debug(formatLog(LogLevel.DEBUG, message, data));
  },

  info: (message, data) => {
    console.info(formatLog(LogLevel.INFO, message, data));
  },

  warn: (message, data) => {
    console.warn(formatLog(LogLevel.WARN, message, data));
  },

  error: (message, error = null) => {
    let errorData = null;

    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };

      // Include Prisma-specific error metadata if available
      if (error.code) {
        errorData.code = error.code;
      }
      if (error.meta) {
        errorData.meta = error.meta;
      }
    } else if (error) {
      errorData = error;
    }

    console.error(formatLog(LogLevel.ERROR, message, errorData));
  },

  // For request/response logging in middleware
  request: (method, path, statusOrMessage, duration = null) => {
    const durationStr = duration ? ` (${duration}ms)` : '';
    const message = `${method} ${path} → ${statusOrMessage}${durationStr}`;
    console.info(formatLog(LogLevel.INFO, message));
  },

  // For database operations
  db: (operation, table, details = null) => {
    const message = `[DB] ${operation} on ${table}`;
    console.debug(formatLog(LogLevel.DEBUG, message, details));
  },

  // For email operations
  email: (operation, details = null) => {
    const message = `[EMAIL] ${operation}`;
    console.info(formatLog(LogLevel.INFO, message, details));
  },

  // For security operations
  security: (operation, details = null) => {
    const message = `[SECURITY] ${operation}`;
    console.warn(formatLog(LogLevel.WARN, message, details));
  },
};

module.exports = logger;
