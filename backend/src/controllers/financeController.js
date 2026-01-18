import { sendSuccess, sendPaginated } from '../utils/response.js';
import * as financeService from '../services/financeService.js';

// Finance Stats
export const getFinanceStats = async (req, res, next) => {
  try {
    const stats = await financeService.getFinanceStats();
    return sendSuccess(res, stats, 'Finance stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Payments
export const getAllPayments = async (req, res, next) => {
  try {
    const result = await financeService.getAllPayments(req.query);
    return sendPaginated(res, result.payments, result.pagination, 'Payments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const payment = await financeService.createPayment(req.body);
    return sendSuccess(res, payment, 'Payment recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await financeService.updatePayment(id, req.body);
    return sendSuccess(res, payment, 'Payment updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await financeService.deletePayment(id);
    return sendSuccess(res, null, 'Payment deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Salaries
export const getAllSalaries = async (req, res, next) => {
  try {
    const result = await financeService.getAllSalaries(req.query);
    return sendPaginated(res, result.salaries, result.pagination, 'Salaries retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createSalary = async (req, res, next) => {
  try {
    const salary = await financeService.createSalary(req.body);
    return sendSuccess(res, salary, 'Salary recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salary = await financeService.updateSalary(id, req.body);
    return sendSuccess(res, salary, 'Salary updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    await financeService.deleteSalary(id);
    return sendSuccess(res, null, 'Salary deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Expenses
export const getAllExpenses = async (req, res, next) => {
  try {
    const result = await financeService.getAllExpenses(req.query);
    return sendPaginated(res, result.expenses, result.pagination, 'Expenses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await financeService.createExpense(req.body);
    return sendSuccess(res, expense, 'Expense recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await financeService.updateExpense(id, req.body);
    return sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    await financeService.deleteExpense(id);
    return sendSuccess(res, null, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Sponsors
export const getAllSponsors = async (req, res, next) => {
  try {
    const sponsors = await financeService.getAllSponsors(req.query);
    return sendSuccess(res, sponsors, 'Sponsors retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createSponsor = async (req, res, next) => {
  try {
    const sponsor = await financeService.createSponsor(req.body);
    return sendSuccess(res, sponsor, 'Sponsor added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSponsor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sponsor = await financeService.updateSponsor(id, req.body);
    return sendSuccess(res, sponsor, 'Sponsor updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteSponsor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await financeService.deleteSponsor(id);
    return sendSuccess(res, null, 'Sponsor deleted successfully');
  } catch (error) {
    next(error);
  }
};

