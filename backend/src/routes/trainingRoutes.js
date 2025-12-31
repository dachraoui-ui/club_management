import express from 'express';
import * as trainingController from '../controllers/trainingController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', trainingController.getAllTrainings);
router.get('/:id', trainingController.getTrainingById);
router.get('/:id/attendance', trainingController.getAttendance);

router.post(
  '/',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('discipline').notEmpty().withMessage('Discipline is required'),
    body('coachId').notEmpty().withMessage('Coach ID is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('maxCapacity').isInt({ min: 1 }).withMessage('Valid max capacity is required'),
  ],
  validateRequest,
  trainingController.createTraining
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  trainingController.updateTraining
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  trainingController.deleteTraining
);

router.post(
  '/:id/attendance',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  [
    body('athleteId').notEmpty().withMessage('Athlete ID is required'),
    body('status').isIn(['Present', 'Absent', 'Late', 'Excused']).withMessage('Invalid attendance status'),
  ],
  validateRequest,
  trainingController.markAttendance
);

export default router;

