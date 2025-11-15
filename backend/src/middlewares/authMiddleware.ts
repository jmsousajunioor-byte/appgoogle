import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido' });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Token inválido ou expirado' });
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
    }
  } catch {
    // Ignora token inválido
  }
  next();
};

