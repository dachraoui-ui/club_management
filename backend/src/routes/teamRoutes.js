import express from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);

router.post(
  '/',
  authorizeRoles('Admin', 'Manager'),
  [
    body('name').notEmpty().withMessage('Team name is required'),
    body('discipline').notEmpty().withMessage('Discipline is required'),
    body('coachId').optional({ nullable: true }),
  ],
  validateRequest,
  teamController.createTeam
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  teamController.updateTeam
);

router.delete(
  '/:id',
  authorizeRoles('Admin'),
  teamController.deleteTeam
);

router.post(
  '/:id/members',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  [
    body('userId').notEmpty().withMessage('User ID is required'),
  ],
  validateRequest,
  teamController.addMemberToTeam
);

router.delete(
  '/:id/members/:userId',
  authorizeRoles('Admin', 'Manager', 'Coach'),
  teamController.removeMemberFromTeam
);

export default router;

