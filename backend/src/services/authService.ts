import { UserModel, CreateUserData } from '../models/User';
import { PasswordResetModel } from '../models/PasswordReset';
import { EmailVerificationModel } from '../models/EmailVerification';
import { SessionModel } from '../models/Session';
import { AuditLogModel } from '../models/AuditLog';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../config/jwt';
import { EmailService } from './emailService';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  static async register(data: CreateUserData, ipAddress?: string, userAgent?: string) {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    if (data.cpf) {
      const existingCPF = await UserModel.findByCPF(data.cpf);
      if (existingCPF) {
        throw new AppError('CPF já cadastrado', 400);
      }
    }

    const passwordHash = await hashPassword(data.password_hash);
    const user = await UserModel.create({ ...data, password_hash: passwordHash });

    const emailVerification = await EmailVerificationModel.create(user.id);
    await EmailService.sendEmailVerification(user.email, user.full_name, emailVerification.token);

    await AuditLogModel.create('REGISTER', user.id, ipAddress, userAgent, { email: user.email });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await SessionModel.create(user.id, accessToken, refreshToken, 30, ipAddress, userAgent);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: accessToken, refreshToken };
  }

  static async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      await AuditLogModel.create('FAILED_LOGIN', undefined, ipAddress, userAgent, { email, reason: 'User not found' });
      throw new AppError('Email ou senha incorretos', 401);
    }

    if (!user.is_active) {
      throw new AppError('Conta desativada', 403);
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      await AuditLogModel.create('FAILED_LOGIN', user.id, ipAddress, userAgent, { email, reason: 'Invalid password' });
      throw new AppError('Email ou senha incorretos', 401);
    }

    await UserModel.updateLastLogin(user.id);
    await AuditLogModel.create('LOGIN', user.id, ipAddress, userAgent);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await SessionModel.create(user.id, accessToken, refreshToken, 30, ipAddress, userAgent);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: accessToken, refreshToken };
  }

  static async logout(token: string, userId: string, ipAddress?: string, userAgent?: string) {
    await SessionModel.delete(token);
    await AuditLogModel.create('LOGOUT', userId, ipAddress, userAgent);
    return { success: true };
  }

  static async forgotPassword(email: string, ipAddress?: string, userAgent?: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return { success: true };
    }

    await PasswordResetModel.deleteByUserId(user.id);
    const passwordReset = await PasswordResetModel.create(user.id, 24);

    await EmailService.sendPasswordResetEmail(user.email, user.full_name, passwordReset.token);
    await AuditLogModel.create('PASSWORD_RESET_REQUEST', user.id, ipAddress, userAgent);

    return { success: true };
  }

  static async resetPassword(token: string, newPassword: string, ipAddress?: string, userAgent?: string) {
    const passwordReset = await PasswordResetModel.findByToken(token);
    if (!passwordReset) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    const user = await UserModel.findById(passwordReset.user_id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const passwordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(user.id, passwordHash);
    await PasswordResetModel.markAsUsed(token);
    await SessionModel.deleteAllByUser(user.id);
    await EmailService.sendPasswordChangedEmail(user.email, user.full_name);
    await AuditLogModel.create('PASSWORD_RESET_COMPLETE', user.id, ipAddress, userAgent);

    return { success: true };
  }

  static async verifyEmail(token: string, ipAddress?: string, userAgent?: string) {
    const emailVerification = await EmailVerificationModel.findByToken(token);
    if (!emailVerification) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    const user = await UserModel.findById(emailVerification.user_id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    await UserModel.verifyEmail(user.id);
    await EmailVerificationModel.markAsVerified(token);
    await EmailService.sendWelcomeEmail(user.email, user.full_name);
    await AuditLogModel.create('EMAIL_VERIFICATION', user.id, ipAddress, userAgent);

    return { success: true };
  }

  static async resendVerificationEmail(email: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.email_verified) {
      throw new AppError('Email já verificado', 400);
    }

    await EmailVerificationModel.deleteByUserId(user.id);
    const emailVerification = await EmailVerificationModel.create(user.id);
    await EmailService.sendEmailVerification(user.email, user.full_name, emailVerification.token);

    return { success: true };
  }
}

