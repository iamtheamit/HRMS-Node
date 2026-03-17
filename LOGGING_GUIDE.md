# HRMS Logging Guide

This document explains the comprehensive logging system added to both the backend (Node.js) and frontend (Next.js) for easier debugging and troubleshooting.

## Overview

The logging system provides:
- **Timestamp-based logs** with color-coded severity levels (DEBUG, INFO, WARN, ERROR)
- **Request/Response tracking** with duration metrics
- **Security logging** for API key validation and auth failures
- **Database operation logging** for Prisma operations
- **Email service logging** for SMTP operations
- **Bootstrap process logging** for application startup

## Backend Logging (Node.js)

### Logger Utility (`src/utils/logger.js`)

A centralized logger that formats all logs with:
- ISO timestamps
- Color-coded severity levels
- Structured JSON output for complex data

### Usage Examples

```javascript
const logger = require('./utils/logger');

// Basic logging
logger.info('User logged in successfully');
logger.warn('Unusual login pattern detected', { userId: 123 });
logger.error('Database connection failed', error);
logger.debug('Request middleware validation passed');

// Specialized logging
logger.security('API key validation', { endpoint: 'POST /api/users', ip: '192.168.1.1' });
logger.email('Email sent successfully', { to: 'user@example.com', messageId: '123' });
logger.db('User created', 'users', { userId: 123 });
logger.request('GET', '/api/users', 200, 45); // method, path, status, duration
```

### Key Logging Points

#### 1. **Application Startup**
```
[2026-03-17T10:30:00.000Z] [INFO] Starting HRMS backend application...
[2026-03-17T10:30:00.123Z] [INFO] Environment: production
[2026-03-17T10:30:00.456Z] [INFO] Configuring CORS with allowed origins
```

#### 2. **Bootstrap Process** (`src/bootstrap/defaultAdmin.js`)
```
[2026-03-17T10:30:01.000Z] [INFO] [BOOTSTRAP] Starting default admin bootstrap process...
[2026-03-17T10:30:01.234Z] [DEBUG] [BOOTSTRAP] Checking if default admin already exists
[2026-03-17T10:30:01.567Z] [INFO] [BOOTSTRAP] Default admin created successfully
```

If bootstrap is disabled:
```
[2026-03-17T10:30:01.000Z] [DEBUG] [BOOTSTRAP] Default admin bootstrap disabled
```

If there's a connection pool timeout:
```
[2026-03-17T10:30:02.000Z] [WARN] [BOOTSTRAP] Skipping default admin bootstrap due to Prisma connection pool timeout
```

#### 3. **API Key Validation** (`src/middleware/apiKey.middleware.js`)
```
[2026-03-17T10:30:05.000Z] [DEBUG] [SECURITY] API request validation
[2026-03-17T10:30:05.100Z] [DEBUG] [SECURITY] API key validation successful
```

If API key is missing:
```
[2026-03-17T10:30:05.000Z] [WARN] [SECURITY] Missing API key header
```

If API key is invalid:
```
[2026-03-17T10:30:05.000Z] [WARN] [SECURITY] Invalid API key provided
```

#### 4. **Request/Response** (Morgan middleware)
```
[2026-03-17T10:30:10.000Z] [INFO] 192.168.1.1 - [17/Mar/2026:10:30:10 +0000] "GET /api/users HTTP/1.1" 200 45 ms
```

#### 5. **Error Handling** (`src/middleware/error.middleware.js`)
```
[2026-03-17T10:30:15.000Z] [ERROR] [DB] Invalid identifier format in request
{
  "name": "PrismaClientValidationError",
  "message": "Invalid 'prisma.user.findUnique()' invocation...",
  "stack": "..."
}
```

#### 6. **Email Service** (`src/services/email/email.provider.js`)
```
[2026-03-17T10:30:20.000Z] [INFO] [EMAIL] Initializing SMTP transporter
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "hasAuth": true
}

[2026-03-17T10:30:21.000Z] [INFO] [EMAIL] Sending email
{
  "to": "user@example.com",
  "subject": "Welcome to HRMS",
  "from": "noreply@hrms.com"
}

[2026-03-17T10:30:25.000Z] [INFO] [EMAIL] Email sent successfully
{
  "messageId": "<abc123@example.com>",
  "durationMs": 4500
}
```

If SMTP is not configured (development):
```
[2026-03-17T10:30:20.000Z] [WARN] [EMAIL] No SMTP configuration found, using Ethereal test account
```

## Frontend Logging (Next.js)

### API Client Logging (`src/shared/api/apiClient.ts`)

All API requests and responses are logged to the browser console with:
- Request method, URL, and parameters
- Response status code and duration
- Error details for failed requests

### Usage Examples in Browser Console

#### 1. **API Initialization**
```
[API] Client initialized {
  baseURL: "https://hrms-node-steel.vercel.app/api",
  hasApiKey: true,
  environment: "production"
}
```

#### 2. **Successful API Request**
```
[2026-03-17T10:30:35.000Z] [REQUEST] GET /auth/user-profile {
  params: {},
  hasData: false,
  hasApiKey: true
}

[2026-03-17T10:30:35.234Z] [RESPONSE] GET /auth/user-profile → 200 (234ms)
```

#### 3. **Failed Request**
```
[2026-03-17T10:30:40.000Z] [REQUEST] POST /api/employees
[2026-03-17T10:30:40.500Z] [ERROR] POST /api/employees → 401 {
  "message": "Unauthorized",
  "data": { ... }
}
```

#### 4. **Token Refresh Flow**
```
[API] 401 Unauthorized - attempting to refresh token...
[API] Calling /auth/refresh...
[API] Token refreshed successfully
[API] Retrying original request
```

Or, if refresh fails:
```
[API] 401 Unauthorized - attempting to refresh token...
[API] Calling /auth/refresh...
[API] Token refresh failed {
  "status": 401,
  "message": "Refresh token expired"
}
[API] Auth state cleared, redirecting to login
```

#### 5. **Missing API Key Warning**
```
[API] NEXT_PUBLIC_API_KEY not configured - API requests will be rejected by backend
```

## Debugging Common Issues

### Issue: "API key missing" or "API key invalid"

**Backend Logs to Check:**
```
[SECURITY] Missing API key header
[SECURITY] Invalid API key provided
```

**Frontend Logs to Check:**
```
[API] NEXT_PUBLIC_API_KEY not configured
[REQUEST] GET /api/users
→ Check if `x-api-key` header is being sent
```

**Solution:**
1. Check `.env` file has `NEXT_PUBLIC_API_KEY` set correctly
2. Check `.env` on backend has `API_SECRET_KEY` matching
3. Check browser console for configuration warning

### Issue: "Prisma connection pool timeout"

**Backend Logs to Check:**
```
[BOOTSTRAP] Skipping default admin bootstrap due to Prisma connection pool timeout
```

**Causes:**
- Cold start on Vercel exhausts connection pool
- Too many simultaneous database connections
- Prisma middleware holding connections

**Solution:**
1. Increase Prisma `pool_size` in `.prisma`
2. Reduce concurrent connections
3. Check if other processes are holding connections

### Issue: "Email not sending"

**Backend Logs to Check:**
```
[EMAIL] No SMTP configuration found
[EMAIL] Initializing SMTP transporter
[EMAIL] Sending email
[EMAIL] Email sent successfully
```

**Frontend Logs to Check:**
```
[ERROR] POST /api/send-email → 500
```

**Solution:**
1. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars
2. Check email logs for initialization errors
3. Try test account (set in Ethereal logs)

### Issue: "CORS errors"

**Backend Logs to Check:**
```
[INFO] Configuring CORS with allowed origins
[ERROR] Not allowed by CORS: https://example.com
```

**Frontend Logs to Check:**
```
[ERROR] POST /api/users → 0 (Network error)
```

**Solution:**
1. Check CORS_ORIGINS env var format
2. Check wildcard patterns (ngrok, Vercel previews)
3. Check `CORS_ALLOW_VERCEL_PREVIEWS` flag

### Issue: "401 Unauthorized" loop

**Frontend Logs to Check:**
```
[API] 401 Unauthorized - attempting to refresh token...
[API] Token refresh failed
[API] Auth state cleared, redirecting to login
```

**Backend Logs to Check:**
```
[API] 401 Unauthorized response
[DB] User not found for token validation
```

**Solution:**
1. Check JWT token expiration
2. Verify refresh token endpoint works
3. Check database for user record

## Log Levels Explained

| Level | Color | Use Case | Example |
|-------|-------|----------|---------|
| **DEBUG** | Cyan | Development, detailed flow | "API key validation successful" |
| **INFO** | Green | Normal operations | "Email sent successfully" |
| **WARN** | Yellow | Non-fatal issues | "Missing API key header" |
| **ERROR** | Red | Failures, exceptions | "Database connection failed" |

## Accessing Logs

### Local Development
- **Backend**: Check terminal where `npm run dev` is running
- **Frontend**: Open browser DevTools → Console tab

### Production (Vercel)
- **Backend**: Vercel Dashboard → Functions → Logs
- **Frontend**: Browser console (use browser's Developer Tools)

## Performance Monitoring

The logs include duration metrics for:
- **API requests**: `(234ms)` - see frontend logs
- **Email sending**: `"durationMs": 4500` - see backend logs
- **Request processing**: view in morgan logs

Look for unusually high durations (>1000ms for API calls) as indicators of performance issues.

## Best Practices

1. **Check logs in order**: Backend request → API key validation → business logic → response
2. **Use timestamps**: Correlate events across frontend/backend logs
3. **Monitor error patterns**: Look for repeated errors in logs
4. **Performance baseline**: Note normal request durations for comparison
5. **Security checks**: Verify API key and CORS logs for authorization issues

## Configuration

To adjust logging verbosity (if needed in future):
- Modify `src/utils/logger.js` to add DEBUG level disable for production
- Adjust morgan format in `src/app.js` for more/less detail
- Modify frontend `logRequest`/`logResponse` functions to be less verbose

---

**Last Updated**: March 2026
**Version**: 1.0.0
