import pino from 'pino';

import { env } from '../config/env';

const REDACTED_FIELDS = [
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'latitude',
  'longitude',
  'email',
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: REDACTED_FIELDS, censor: '[REDACTED]' },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  serializers: {
    req: (req: { method: string; url: string; userId?: string }) => ({
      method: req.method,
      url: req.url,
      userId: req.userId ?? 'anonymous',
    }),
    err: pino.stdSerializers.err,
  },
});
