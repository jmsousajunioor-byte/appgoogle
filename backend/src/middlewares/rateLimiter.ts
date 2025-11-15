import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: { success: false, message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Limite de registros atingido. Tente novamente mais tarde.' },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Limite de tentativas de recuperação atingido. Tente novamente mais tarde.' },
});

