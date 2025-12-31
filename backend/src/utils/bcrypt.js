import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

