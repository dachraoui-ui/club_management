import { sendSuccess } from '../utils/response.js';
import * as trainingService from '../services/trainingService.js';

export const getAllTrainings = async (req, res, next) => {
  try {
    const trainings = await trainingService.getAllTrainings(req.query);
    return sendSuccess(res, trainings, 'Training sessions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTrainingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await trainingService.getTrainingById(id);
    return sendSuccess(res, training, 'Training session retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTraining = async (req, res, next) => {
  try {
    const training = await trainingService.createTraining(req.body);
    return sendSuccess(res, training, 'Training session created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const training = await trainingService.updateTraining(id, req.body);
    return sendSuccess(res, training, 'Training session updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await trainingService.deleteTraining(id);
    return sendSuccess(res, result, 'Training session deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await trainingService.markAttendance(id, req.body);
    return sendSuccess(res, attendance, 'Attendance marked successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await trainingService.getAttendance(id);
    return sendSuccess(res, attendance, 'Attendance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

