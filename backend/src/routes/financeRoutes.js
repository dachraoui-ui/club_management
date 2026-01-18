import express from 'express';
import * as financeController from '../controllers/financeController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateToken);

// Dashboard Stats
router.get('/stats', financeController.getFinanceStats);

// Payments
router.get('/payments', financeController.getAllPayments);
router.post(
  '/payments',
  authorizeRoles('Admin', 'Manager', 'Staff'),
  [
    body('memberId').notEmpty().withMessage('Member ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('status').isIn(['Paid', 'Pending', 'Overdue']).withMessage('Invalid payment status'),
    body('type').isIn(['Membership', 'Training', 'Event', 'Equipment']).withMessage('Invalid payment type'),
    body('method').isIn(['Card', 'Cash', 'BankTransfer']).withMessage('Invalid payment method'),
  ],
  validateRequest,
  financeController.createPayment
);
router.put(
  '/payments/:id',
  authorizeRoles('Admin', 'Manager', 'Staff'),
  financeController.updatePayment
);
router.delete(
  '/payments/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.deletePayment
);

// Salaries
router.get('/salaries', financeController.getAllSalaries);
router.post(
  '/salaries',
  authorizeRoles('Admin', 'Manager'),
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('month').isISO8601().withMessage('Valid month is required'),
    body('type').isIn(['Player', 'Coach', 'Staff', 'Manager']).withMessage('Invalid salary type'),
    body('status').isIn(['Paid', 'Pending', 'Overdue']).withMessage('Invalid salary status'),
  ],
  validateRequest,
  financeController.createSalary
);
router.put(
  '/salaries/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.updateSalary
);
router.delete(
  '/salaries/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.deleteSalary
);

// Expenses
router.get('/expenses', financeController.getAllExpenses);
router.post(
  '/expenses',
  authorizeRoles('Admin', 'Manager'),
  [
    body('description').notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  validateRequest,
  financeController.createExpense
);
router.put(
  '/expenses/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.updateExpense
);
router.delete(
  '/expenses/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.deleteExpense
);

// Sponsors
router.get('/sponsors', financeController.getAllSponsors);
router.post(
  '/sponsors',
  authorizeRoles('Admin', 'Manager'),
  [
    body('name').notEmpty().withMessage('Sponsor name is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('status').isIn(['Active', 'Expired', 'Pending']).withMessage('Invalid sponsor status'),
    body('tier').isIn(['Gold', 'Silver', 'Bronze']).withMessage('Invalid sponsor tier'),
  ],
  validateRequest,
  financeController.createSponsor
);

router.put(
  '/sponsors/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.updateSponsor
);

router.delete(
  '/sponsors/:id',
  authorizeRoles('Admin', 'Manager'),
  financeController.deleteSponsor
);

export default router;

