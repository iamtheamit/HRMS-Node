// app.js
// Creates and configures the Express app instance for both local and serverless runtimes.

require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const departmentRoutes = require('./routes/department.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const hrAdminRoutes = require('./routes/hrAdmin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const mediaRoutes = require('./routes/media.routes');
const errorMiddleware = require('./middleware/error.middleware');
const apiKeyMiddleware = require('./middleware/apiKey.middleware');
const { createSwaggerSpec } = require('./config/swagger');
const { ensureDefaultAdmin } = require('./bootstrap/defaultAdmin');
const { apiBaseUrl, corsOrigins } = require('./config/app');

const app = express();

// Bootstrap default admin account on application startup
logger.info('Starting HRMS backend application...');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

ensureDefaultAdmin().catch((error) => {
  logger.error('Default admin bootstrap failed', error);
});

const normalizeOrigin = (value) => {
  if (!value) return '';

  try {
    const parsed = new URL(value);
    return parsed.origin.toLowerCase();
  } catch (error) {
    return String(value).trim().replace(/\/$/, '').toLowerCase();
  }
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;

  return fallback;
};

const originPatterns = corsOrigins
  .map((value) => String(value || '').trim().toLowerCase().replace(/\/$/, ''))
  .filter(Boolean);

const exactAllowedOrigins = new Set(originPatterns.filter((pattern) => !pattern.includes('*')).map(normalizeOrigin));
const wildcardOriginPatterns = originPatterns.filter((pattern) => pattern.includes('*'));
// Optional: Allow all Vercel preview deployment origins (*.vercel.app)
// Useful when testing with multiple preview branches, but can be disabled for stricter CORS
const allowVercelPreviewOrigins = parseBoolean(process.env.CORS_ALLOW_VERCEL_PREVIEWS, false);

// Checks if a normalized origin matches a wildcard pattern (e.g., https://*.ngrok-free.app)
const matchesWildcardOrigin = (normalizedOrigin, pattern) => {
  if (pattern === '*') return true;

  try {
    const parsedOrigin = new URL(normalizedOrigin);

    if (pattern.startsWith('http://*.') || pattern.startsWith('https://*.')) {
      const wildcardUrl = new URL(pattern.replace('*.', 'placeholder.'));
      const patternSuffix = wildcardUrl.hostname.replace(/^placeholder\./, '');
      return (
        parsedOrigin.protocol === wildcardUrl.protocol &&
        parsedOrigin.hostname.toLowerCase().endsWith(`.${patternSuffix}`)
      );
    }

    if (pattern.startsWith('*.')) {
      const patternSuffix = pattern.slice(2);
      return parsedOrigin.hostname.toLowerCase().endsWith(`.${patternSuffix}`);
    }

    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
      return regex.test(normalizedOrigin);
    }
  } catch (error) {
    return false;
  }

  return false;
};

const isAllowedOrigin = (normalizedOrigin) => {
  if (exactAllowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  return wildcardOriginPatterns.some((pattern) => matchesWildcardOrigin(normalizedOrigin, pattern));
};

// Detects if an origin is a Vercel preview deployment (dynamically generated URLs)
const isVercelPreviewOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return parsed.hostname.toLowerCase().endsWith('.vercel.app');
  } catch (error) {
    return false;
  }
};

const resolveSwaggerServerUrl = (req) => {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get('host');

  if (protocol && host) {
    return `${protocol}://${host}`;
  }

  const configuredBaseUrl = String(apiBaseUrl || '').trim();
  if (configuredBaseUrl) {
    try {
      return new URL(configuredBaseUrl).origin;
    } catch (error) {
      return configuredBaseUrl.replace(/\/$/, '');
    }
  }

  return '';
};

const isLocalLoopbackOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1'].includes(parsed.hostname.toLowerCase());
  } catch (error) {
    return false;
  }
};

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || originPatterns.length === 0) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (isAllowedOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production' && isLocalLoopbackOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    if (allowVercelPreviewOrigins && isVercelPreviewOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
};

// Configure CORS with detailed logging
logger.info('Configuring CORS with allowed origins', {
  exactOrigins: Array.from(exactAllowedOrigins),
  wildcardPatterns: wildcardOriginPatterns,
  allowVercelPreviews: allowVercelPreviewOrigins,
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure morgan with custom token for better debugging
morgan.token('req-headers', (req) => JSON.stringify({
  'x-api-key': req.headers['x-api-key'] ? '*hidden*' : 'missing',
  'user-agent': req.headers['user-agent'],
  'origin': req.headers['origin'],
}));

morgan.token('error-msg', (req, res) => {
  const error = res.locals.errorMessage;
  return error ? `| Error: ${error}` : '';
});

// Use detailed morgan format for request logging
const morganFormat = ':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms ":req-headers" :error-msg';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Only log at INFO level, morgan handles the formatting
      logger.info(message.trim());
    },
  },
}));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS API is running',
  });
});

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(createSwaggerSpec(resolveSwaggerServerUrl(req)));
});

app.get(['/api-docs', '/api-docs/'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HRMS API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body { margin: 0; padding: 0; }
      #swagger-ui { min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'BaseLayout'
      });
    </script>
  </body>
</html>`);
});

app.use('/api', apiKeyMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/hr-admin', hrAdminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/media', mediaRoutes);

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

module.exports = app;
