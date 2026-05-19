import rateLimit from 'express-rate-limit';

// General API rate limit: 100 requests per minute
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Rate limit exceeded. Try again later.', statusCode: 429 },
});

// Login rate limit: 5 attempts per 15 minutes
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts', message: 'Too many login attempts. Try again in 15 minutes.', statusCode: 429 },
});

// Location sharing rate limit: 30 per minute per user
export const locationRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip || 'unknown',
  message: { error: 'Too many location updates', message: 'Location sharing rate limit exceeded.', statusCode: 429 },
});
