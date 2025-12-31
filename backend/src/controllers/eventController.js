import { sendSuccess } from '../utils/response.js';
import * as eventService from '../services/eventService.js';

export const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents(req.query);
    return sendSuccess(res, events, 'Events retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    return sendSuccess(res, event, 'Event retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    return sendSuccess(res, event, 'Event created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.updateEvent(id, req.body);
    return sendSuccess(res, event, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await eventService.deleteEvent(id);
    return sendSuccess(res, result, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.user.id;
    const participant = await eventService.registerForEvent(id, userId);
    return sendSuccess(res, participant, 'Registered for event successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const unregisterFromEvent = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const targetUserId = userId || req.user.id;
    const result = await eventService.unregisterFromEvent(id, targetUserId);
    return sendSuccess(res, result, 'Unregistered from event successfully');
  } catch (error) {
    next(error);
  }
};

export const updateParticipantResult = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { result } = req.body;
    const participant = await eventService.updateParticipantResult(id, userId, result);
    return sendSuccess(res, participant, 'Participant result updated successfully');
  } catch (error) {
    next(error);
  }
};

