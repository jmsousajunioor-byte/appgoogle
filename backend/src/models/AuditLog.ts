import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: AuditAction;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: Date;
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'EMAIL_VERIFICATION'
  | 'DATA_ACCESS'
  | 'DATA_UPDATE'
  | 'DATA_DELETE'
  | 'CONSENT_UPDATE'
  | 'FAILED_LOGIN';

export class AuditLogModel {
  static async create(
    action: AuditAction,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any,
  ): Promise<AuditLog> {
    const id = uuidv4();
    const result = await pool.query(
      `
        INSERT INTO audit_logs (id, user_id, action, ip_address, user_agent, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [id, userId || null, action, ipAddress || null, userAgent || null, metadata ? JSON.stringify(metadata) : null, new Date()],
    );

    return result.rows[0];
  }

  static async findByUserId(userId: string, limit = 50): Promise<AuditLog[]> {
    const result = await pool.query(
      `
        SELECT * FROM audit_logs 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `,
      [userId, limit],
    );

    return result.rows;
  }

  static async findByAction(action: AuditAction, limit = 100): Promise<AuditLog[]> {
    const result = await pool.query(
      `
        SELECT * FROM audit_logs 
        WHERE action = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `,
      [action, limit],
    );
    return result.rows;
  }

  static async deleteOlderThan(days: number): Promise<void> {
    await pool.query(
      `
        DELETE FROM audit_logs 
        WHERE created_at < NOW() - INTERVAL '${days} days'
      `,
    );
  }
}

