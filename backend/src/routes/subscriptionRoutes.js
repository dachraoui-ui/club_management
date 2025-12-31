import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', subscriptionController.getAllSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionById);

router.post(
  '/',
  authorizeRoles('Admin', 'Manager'),
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('type').isIn(['Basic', 'Premium', 'Elite']).withMessage('Invalid subscription type'),
    body('status').isIn(['Active', 'Inactive', 'Pending']).withMessage('Invalid status'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  ],
  validateRequest,
  subscriptionController.createSubscription
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Manager'),
  subscriptionController.updateSubscription
);

router.patch(
  '/:id/renew',
  authorizeRoles('Admin', 'Manager'),
  subscriptionController.renewSubscription
);

export default router;

