import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  profile_image_url?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: Date;
  privacy_accepted: boolean;
  privacy_accepted_at?: Date;
  marketing_consent: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  deleted_at?: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  birth_date?: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_consent?: boolean;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO users (
        id, email, password_hash, full_name, cpf, phone, birth_date,
        terms_accepted, terms_accepted_at, privacy_accepted, privacy_accepted_at,
        marketing_consent, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      id,
      data.email.toLowerCase(),
      data.password_hash,
      data.full_name,
      data.cpf || null,
      data.phone || null,
      data.birth_date || null,
      data.terms_accepted,
      data.terms_accepted ? now : null,
      data.privacy_accepted,
      data.privacy_accepted ? now : null,
      data.marketing_consent || false,
      now,
      now,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [
      email.toLowerCase(),
    ]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    return result.rows[0] || null;
  }

  static async findByCPF(cpf: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE cpf = $1 AND deleted_at IS NULL', [cpf]);
    return result.rows[0] || null;
  }

  static async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await pool.query(
      `
        UPDATE users 
        SET password_hash = $1, updated_at = $2 
        WHERE id = $3
      `,
      [passwordHash, new Date(), userId],
    );
  }

  static async verifyEmail(userId: string): Promise<void> {
    await pool.query(
      `
        UPDATE users 
        SET email_verified = true, updated_at = $1 
        WHERE id = $2
      `,
      [new Date(), userId],
    );
  }

  static async updateLastLogin(userId: string): Promise<void> {
    const now = new Date();
    await pool.query(
      `
        UPDATE users 
        SET last_login = $1, updated_at = $1 
        WHERE id = $2
      `,
      [now, userId],
    );
  }

  static async update(userId: string, data: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push((data as any)[key]);
        paramCount += 1;
      }
    });

    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount += 1;
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async softDelete(userId: string): Promise<void> {
    const now = new Date();
    await pool.query(
      `
        UPDATE users 
        SET deleted_at = $1, is_active = false, updated_at = $1 
        WHERE id = $2
      `,
      [now, userId],
    );
  }

  static async hardDelete(userId: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }
}

