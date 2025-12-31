import { sendSuccess } from '../utils/response.js';
import * as statisticsService from '../services/statisticsService.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await statisticsService.getDashboardStats();
    return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAthleteStats = async (req, res, next) => {
  try {
    const stats = await statisticsService.getAthleteStats();
    return sendSuccess(res, stats, 'Athlete statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFinanceStats = async (req, res, next) => {
  try {
    const stats = await statisticsService.getFinanceStats();
    return sendSuccess(res, stats, 'Financial statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMembershipDistribution = async (req, res, next) => {
  try {
    const distribution = await statisticsService.getMembershipDistribution();
    return sendSuccess(res, distribution, 'Membership distribution retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSportsDistribution = async (req, res, next) => {
  try {
    const distribution = await statisticsService.getSportsDistribution();
    return sendSuccess(res, distribution, 'Sports distribution retrieved successfully');
  } catch (error) {
    next(error);
  }
};

