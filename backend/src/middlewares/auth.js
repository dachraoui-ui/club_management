import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendError(res, 'Access token required', 401);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return sendError(res, error.message || 'Invalid or expired token', 401);
  }
};

