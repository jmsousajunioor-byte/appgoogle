import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { validateEmail, validatePassword, validateCPF, validateAge } from '../utils/validators';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        password,
        confirmPassword,
        fullName,
        cpf,
        phone,
        birthDate,
        termsAccepted,
        privacyAccepted,
        marketingConsent,
      } = req.body;

      if (!email || !password || !fullName || !termsAccepted || !privacyAccepted) {
        throw new AppError('Campos obrigatórios não preenchidos', 400);
      }

      if (!validateEmail(email)) {
        throw new AppError('Email inválido', 400);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(', '), 400);
      }

      if (password !== confirmPassword) {
        throw new AppError('As senhas não coincidem', 400);
      }

      if (cpf && !validateCPF(cpf)) {
        throw new AppError('CPF inválido', 400);
      }

      if (birthDate && !validateAge(birthDate)) {
        throw new AppError('Você deve ter pelo menos 18 anos', 400);
      }

      const result = await AuthService.register(
        {
          email,
          password_hash: password,
          full_name: fullName,
          cpf,
          phone,
          birth_date: birthDate,
          terms_accepted: termsAccepted,
          privacy_accepted: privacyAccepted,
          marketing_consent: marketingConsent,
        },
        req.ip,
        req.get('user-agent'),
      );

      res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso! Verifique seu email.',
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email e senha são obrigatórios', 400);
      }

      const result = await AuthService.login(email, password, req.ip, req.get('user-agent'));
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new AppError('Token não fornecido', 400);
      }

      await AuthService.logout(token, req.userId!, req.ip, req.get('user-agent'));
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError('Email é obrigatório', 400);
      }
      if (!validateEmail(email)) {
        throw new AppError('Email inválido', 400);
      }

      await AuthService.forgotPassword(email, req.ip, req.get('user-agent'));
      res.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password, confirmPassword } = req.body;
      if (!token || !password || !confirmPassword) {
        throw new AppError('Todos os campos são obrigatórios', 400);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(', '), 400);
      }

      if (password !== confirmPassword) {
        throw new AppError('As senhas não coincidem', 400);
      }

      await AuthService.resetPassword(token, password, req.ip, req.get('user-agent'));
      res.json({ success: true, message: 'Senha redefinida com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      if (!token) {
        throw new AppError('Token não fornecido', 400);
      }

      await AuthService.verifyEmail(token, req.ip, req.get('user-agent'));
      res.json({ success: true, message: 'Email verificado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError('Email é obrigatório', 400);
      }

      await AuthService.resendVerificationEmail(email);
      res.json({ success: true, message: 'Email de verificação reenviado' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserModel.findById(req.userId!);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const { password_hash, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }
}

// Lazy import to prevent circular dependency at top level
import { UserModel } from '../models/User';

