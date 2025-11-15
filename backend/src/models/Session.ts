import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
}

export class SessionModel {
  static async create(
    userId: string,
    token: string,
    refreshToken: string,
    expiryDays: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Session> {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    const result = await pool.query(
      `
        INSERT INTO sessions (
          id, user_id, token, refresh_token, ip_address, user_agent, 
          expires_at, created_at, last_activity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [id, userId, token, refreshToken, ipAddress || null, userAgent || null, expiresAt, now, now],
    );

    return result.rows[0];
  }

  static async findByToken(token: string): Promise<Session | null> {
    const result = await pool.query('SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()', [token]);
    return result.rows[0] || null;
  }

  static async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const result = await pool.query('SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()', [
      refreshToken,
    ]);
    return result.rows[0] || null;
  }

  static async updateActivity(sessionId: string): Promise<void> {
    await pool.query(
      `
        UPDATE sessions 
        SET last_activity = $1 
        WHERE id = $2
      `,
      [new Date(), sessionId],
    );
  }

  static async delete(token: string): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  static async deleteAllByUser(userId: string): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  }

  static async deleteExpired(): Promise<void> {
    await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
  }
}

