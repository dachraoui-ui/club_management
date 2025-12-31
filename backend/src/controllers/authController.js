import { sendSuccess, sendError } from '../utils/response.js';
import * as authService from '../services/authService.js';
import { generateAccessToken } from '../utils/jwt.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

/**
 * Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const result = await authService.loginUser(email, password);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Register (Admin only)
 */
export const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const user = await authService.registerUser(userData);
    return sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Fetch user to get current role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    
    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return sendSuccess(res, { accessToken }, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (req, res) => {
  // In a production app, you might want to blacklist the refresh token
  // For now, we'll just return success
  return sendSuccess(res, null, 'Logged out successfully');
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400);
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);
    return sendSuccess(res, result, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

