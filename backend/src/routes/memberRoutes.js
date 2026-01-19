import express from 'express';
import * as memberController from '../controllers/memberController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all members
router.get('/', memberController.getAllMembers);

// Get member by ID
router.get('/:id', memberController.getMemberById);

// Create member (Admin/Manager only)
router.post(
  '/',
  authorizeRoles('Admin', 'Manager'),
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phone').notEmpty().withMessage('Phone number is required').custom((value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 8) {
        throw new Error('Phone number must be exactly 8 digits');
      }
      return true;
    }),
    body('role').optional().isIn(['Athlete', 'Coach', 'Staff']).withMessage('Invalid role. Must be Athlete, Coach, or Staff'),
    body('emergencyContact').optional().custom((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 8) {
        throw new Error('Emergency contact must be exactly 8 digits');
      }
      return true;
    }),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required').custom((value) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
      
      if (actualAge < 5) {
        throw new Error('Member must be at least 5 years old');
      }
      return true;
    }),
    body('teamId').optional().isUUID().withMessage('Invalid team ID'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  ],
  validateRequest,
  memberController.createMember
);

// Update member (Admin/Manager only)
router.put(
  '/:id',
  authorizeRoles('Admin', 'Manager'),
  memberController.updateMember
);

// Update member status (Admin/Manager only)
router.patch(
  '/:id/status',
  authorizeRoles('Admin', 'Manager'),
  [
    body('status').isIn(['Active', 'Inactive', 'Pending']).withMessage('Invalid status. Must be Active, Inactive, or Pending'),
  ],
  validateRequest,
  memberController.updateMemberStatus
);

// Delete member (Admin only)
router.delete(
  '/:id',
  authorizeRoles('Admin'),
  memberController.deleteMember
);

export default router;

