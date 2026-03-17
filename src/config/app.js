const DEFAULT_PORT = 5000;
const DEFAULT_ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const DEFAULT_REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;

  return fallback;
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSameSite = (value, fallback) => {
  const normalized = String(value || fallback).trim().toLowerCase();
  return ['lax', 'strict', 'none'].includes(normalized) ? normalized : fallback;
};

const normalizeCookieDomain = (value) => {
  if (!value) return undefined;

  const normalized = String(value).trim();
  if (!normalized || ['localhost', '127.0.0.1'].includes(normalized)) {
    return undefined;
  }

  return normalized;
};

const normalizePublicBaseUrl = (value, fallback) => {
  const raw = String(value || '').trim();
  const fallbackUrl = String(fallback || '').trim();
  if (!raw) return fallbackUrl;

  const ensureProtocol = (input) => (/^https?:\/\//i.test(input) ? input : `https://${input}`);

  try {
    return new URL(ensureProtocol(raw)).origin;
  } catch (error) {
    return fallbackUrl;
  }
};

const port = parsePositiveInteger(process.env.PORT, DEFAULT_PORT);
const apiBaseUrl = normalizePublicBaseUrl(process.env.API_BASE_URL, `http://localhost:${port}`);
const frontendUrl = normalizePublicBaseUrl(process.env.FRONTEND_URL, 'http://localhost:3000');

const accessTokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || 'hrms_access_token';
const refreshTokenCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || 'hrms_refresh_token';

const accessTokenMaxAgeMs = parsePositiveInteger(
  process.env.ACCESS_TOKEN_MAX_AGE_MS,
  DEFAULT_ACCESS_TOKEN_MAX_AGE_MS,
);

const refreshTokenMaxAgeMs = parsePositiveInteger(
  process.env.REFRESH_TOKEN_MAX_AGE_MS,
  DEFAULT_REFRESH_TOKEN_MAX_AGE_MS,
);

const cookieHttpOnly = parseBoolean(process.env.COOKIE_HTTP_ONLY, true);
const cookieSecure = parseBoolean(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production');
const configuredSameSite = normalizeSameSite(process.env.COOKIE_SAME_SITE, 'lax');
const cookieSameSite = configuredSameSite === 'none' && !cookieSecure ? 'lax' : configuredSameSite;
const cookieDomain = normalizeCookieDomain(process.env.COOKIE_DOMAIN);

const cookieOptionsBase = {
  httpOnly: cookieHttpOnly,
  sameSite: cookieSameSite,
  secure: cookieSecure,
  path: '/',
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};

const accessTokenCookieOptions = {
  ...cookieOptionsBase,
  maxAge: accessTokenMaxAgeMs,
};

const refreshTokenCookieOptions = {
  ...cookieOptionsBase,
  maxAge: refreshTokenMaxAgeMs,
};

const clearCookieOptions = {
  ...cookieOptionsBase,
};

const accessTokenExpiresInSeconds = Math.max(1, Math.floor(accessTokenMaxAgeMs / 1000));

const corsOrigins = (process.env.CORS_ORIGIN || frontendUrl)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  apiBaseUrl,
  frontendUrl,
  accessTokenCookieName,
  refreshTokenCookieName,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
  accessTokenMaxAgeMs,
  refreshTokenMaxAgeMs,
  accessTokenExpiresInSeconds,
  corsOrigins,
};