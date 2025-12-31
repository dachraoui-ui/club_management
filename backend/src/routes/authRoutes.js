import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

// Login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

// Register (Admin only)
router.post(
  '/register',
  authenticateToken,
  authorizeRoles('Admin'),
  authRateLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['Admin', 'Manager', 'Coach', 'Staff', 'Athlete']).withMessage('Invalid role'),
  ],
  validateRequest,
  authController.register
);

// Refresh token
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  validateRequest,
  authController.refresh
);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Change password
router.patch(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validateRequest,
  authController.changePassword
);

export default router;

