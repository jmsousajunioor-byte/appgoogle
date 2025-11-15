import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AuditLogModel } from '../models/AuditLog';
import { AppError } from '../middlewares/errorHandler';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { EmailService } from '../services/emailService';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserModel.findById(req.userId!);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      await AuditLogModel.create('DATA_ACCESS', req.userId, req.ip, req.get('user-agent'));
      const { password_hash, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, phone, birthDate, profileImageUrl } = req.body;
      const updateData: Record<string, unknown> = {};
      if (fullName) updateData.full_name = fullName;
      if (phone) updateData.phone = phone;
      if (birthDate) updateData.birth_date = birthDate;
      if (profileImageUrl) updateData.profile_image_url = profileImageUrl;

      const updatedUser = await UserModel.update(req.userId!, updateData);
      await AuditLogModel.create('DATA_UPDATE', req.userId, req.ip, req.get('user-agent'), {
        fields: Object.keys(updateData),
      });

      const { password_hash, ...userWithoutPassword } = updatedUser;
      res.json({ success: true, message: 'Perfil atualizado com sucesso', user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new AppError('Todos os campos são obrigatórios', 400);
      }
      if (newPassword !== confirmPassword) {
        throw new AppError('As senhas não coincidem', 400);
      }

      const user = await UserModel.findById(req.userId!);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const isValid = await comparePassword(currentPassword, user.password_hash);
      if (!isValid) {
        throw new AppError('Senha atual incorreta', 401);
      }

      const newPasswordHash = await hashPassword(newPassword);
      await UserModel.updatePassword(req.userId!, newPasswordHash);
      await AuditLogModel.create('PASSWORD_CHANGE', req.userId, req.ip, req.get('user-agent'));
      await EmailService.sendPasswordChangedEmail(user.email, user.full_name);

      res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, confirmDeletion } = req.body;
      if (!password || !confirmDeletion) {
        throw new AppError('Confirmação de exclusão necessária', 400);
      }

      const user = await UserModel.findById(req.userId!);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        throw new AppError('Senha incorreta', 401);
      }

      await UserModel.softDelete(req.userId!);
      await AuditLogModel.create('DATA_DELETE', req.userId, req.ip, req.get('user-agent'));

      res.json({ success: true, message: 'Conta excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AuditLogModel.findByUserId(req.userId!, 50);
      res.json({ success: true, logs });
    } catch (error) {
      next(error);
    }
  }

  static async updateConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { marketingConsent } = req.body;
      if (typeof marketingConsent !== 'boolean') {
        throw new AppError('Consentimento inválido', 400);
      }

      await UserModel.update(req.userId!, { marketing_consent: marketingConsent });
      await AuditLogModel.create('CONSENT_UPDATE', req.userId, req.ip, req.get('user-agent'), { marketingConsent });

      res.json({ success: true, message: 'Preferências atualizadas com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

