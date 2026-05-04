import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 12;

export const authService = {
  /**
   * Register a new user
   */
  async register({ full_name, email, password, role, phone }) {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new AppError('Ya existe una cuenta con este email', 409, 'EmailTaken');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = uuidv4();

    const result = await query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, phone, role, created_at, updated_at`,
      [userId, email.toLowerCase(), passwordHash, full_name, phone || null, role]
    );

    const user = result.rows[0];

    // Create default notification preferences
    await query(
      `INSERT INTO notification_preferences (id, user_id, channels, reminder_times)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO NOTHING`,
      [uuidv4(), userId, JSON.stringify(['email']), JSON.stringify([60, 1440])]
    );

    const { token, refreshToken } = generateTokens(user);
    return { user, token, refresh_token: refreshToken };
  },

  /**
   * Login user
   */
  async login({ email, password }) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('No existe ninguna cuenta con este email', 401, 'UserNotFound');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new AppError('Contraseña incorrecta', 401, 'InvalidPassword');
    }

    const { token, refreshToken } = generateTokens(user);

    // Return user without password
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token, refresh_token: refreshToken };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET + '_refresh');
    } catch {
      throw new AppError('Refresh token inválido', 401, 'InvalidRefreshToken');
    }

    const result = await query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      throw new AppError('Usuario no encontrado', 401, 'UserNotFound');
    }

    const user = result.rows[0];
    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user);
    return { token: newToken, refresh_token: newRefreshToken };
  },

  /**
   * Get current user by ID
   */
  async getUserById(userId) {
    const result = await query(
      'SELECT id, email, full_name, phone, address, role, profile_picture_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Usuario no encontrado', 404, 'UserNotFound');
    }
    return result.rows[0];
  },

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) throw new AppError('Usuario no encontrado', 404);

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) throw new AppError('Contraseña actual incorrecta', 400, 'InvalidPassword');

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
  },
};

function generateTokens(user) {
  const payload = { userId: user.id, email: user.email, role: user.role };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });

  const refreshToken = jwt.sign(payload, env.JWT_SECRET + '_refresh', {
    expiresIn: env.REFRESH_TOKEN_EXPIRATION,
  });

  return { token, refreshToken };
}
