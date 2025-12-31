import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

router.post(
  '/',
  authorizeRoles('Admin', 'Manager'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('type').isIn(['Tournament', 'Workshop', 'Social', 'Competition']).withMessage('Invalid event type'),
    body('location').notEmpty().withMessage('Location is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Valid capacity is required'),
  ],
  validateRequest,
  eventController.createEvent
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Manager'),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Manager'),
  eventController.deleteEvent
);

router.post(
  '/:id/participants',
  [
    body('userId').optional().notEmpty().withMessage('User ID must not be empty if provided'),
  ],
  validateRequest,
  eventController.registerForEvent
);

router.delete(
  '/:id/participants/:userId',
  eventController.unregisterFromEvent
);

router.patch(
  '/:id/participants/:userId',
  authorizeRoles('Admin', 'Manager'),
  [
    body('result').notEmpty().withMessage('Result is required'),
  ],
  validateRequest,
  eventController.updateParticipantResult
);

export default router;

