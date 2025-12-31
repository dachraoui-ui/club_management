import express from 'express';
import * as statisticsController from '../controllers/statisticsController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', statisticsController.getDashboardStats);
router.get('/athletes', statisticsController.getAthleteStats);
router.get('/finance', statisticsController.getFinanceStats);
router.get('/membership', statisticsController.getMembershipDistribution);
router.get('/sports', statisticsController.getSportsDistribution);

export default router;

