import { sendSuccess, sendPaginated } from '../utils/response.js';
import * as financeService from '../services/financeService.js';

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

