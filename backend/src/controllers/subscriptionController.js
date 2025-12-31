import { sendSuccess, sendPaginated } from '../utils/response.js';
import * as subscriptionService from '../services/subscriptionService.js';

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const result = await subscriptionService.getAllSubscriptions(req.query);
    return sendPaginated(res, result.subscriptions, result.pagination, 'Subscriptions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.getSubscriptionById(id);
    return sendSuccess(res, subscription, 'Subscription retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);
    return sendSuccess(res, subscription, 'Subscription created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.updateSubscription(id, req.body);
    return sendSuccess(res, subscription, 'Subscription updated successfully');
  } catch (error) {
    next(error);
  }
};

export const renewSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.renewSubscription(id);
    return sendSuccess(res, subscription, 'Subscription renewed successfully');
  } catch (error) {
    next(error);
  }
};

