import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export class PasswordResetModel {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async create(userId: string, expiryHours = 24): Promise<PasswordReset> {
    const id = uuidv4();
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const result = await pool.query(
      `
        INSERT INTO password_resets (id, user_id, token, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [id, userId, token, expiresAt, new Date()],
    );

    return result.rows[0];
  }

  static async findByToken(token: string): Promise<PasswordReset | null> {
    const result = await pool.query(
      `
        SELECT * FROM password_resets 
        WHERE token = $1 AND used = false AND expires_at > NOW()
      `,
      [token],
    );
    return result.rows[0] || null;
  }

  static async markAsUsed(token: string): Promise<void> {
    await pool.query('UPDATE password_resets SET used = true WHERE token = $1', [token]);
  }

  static async deleteExpired(): Promise<void> {
    await pool.query('DELETE FROM password_resets WHERE expires_at < NOW()');
  }

  static async deleteByUserId(userId: string): Promise<void> {
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
  }
}

