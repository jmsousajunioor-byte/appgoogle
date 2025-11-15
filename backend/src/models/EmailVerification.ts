import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  verified: boolean;
  created_at: Date;
}

export class EmailVerificationModel {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async create(userId: string, expiryHours = 24): Promise<EmailVerification> {
    const id = uuidv4();
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const result = await pool.query(
      `
        INSERT INTO email_verifications (id, user_id, token, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [id, userId, token, expiresAt, new Date()],
    );

    return result.rows[0];
  }

  static async findByToken(token: string): Promise<EmailVerification | null> {
    const result = await pool.query(
      `
        SELECT * FROM email_verifications 
        WHERE token = $1 AND verified = false AND expires_at > NOW()
      `,
      [token],
    );
    return result.rows[0] || null;
  }

  static async markAsVerified(token: string): Promise<void> {
    await pool.query('UPDATE email_verifications SET verified = true WHERE token = $1', [token]);
  }

  static async deleteExpired(): Promise<void> {
    await pool.query('DELETE FROM email_verifications WHERE expires_at < NOW()');
  }

  static async deleteByUserId(userId: string): Promise<void> {
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
  }
}

