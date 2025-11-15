import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.error({ message: err.message, statusCode: err.statusCode, stack: err.stack, url: req.url, method: req.method });
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  logger.error({ message: err.message, stack: err.stack, url: req.url, method: req.method });
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
};

