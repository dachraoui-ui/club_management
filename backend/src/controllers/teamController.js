import { sendSuccess } from '../utils/response.js';
import * as teamService from '../services/teamService.js';

export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams(req.query);
    return sendSuccess(res, teams, 'Teams retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await teamService.getTeamById(id);
    return sendSuccess(res, team, 'Team retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    return sendSuccess(res, team, 'Team created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await teamService.updateTeam(id, req.body);
    return sendSuccess(res, team, 'Team updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await teamService.deleteTeam(id);
    return sendSuccess(res, result, 'Team deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addMemberToTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const result = await teamService.addMemberToTeam(id, userId);
    return sendSuccess(res, result, 'Member added to team successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const removeMemberFromTeam = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const result = await teamService.removeMemberFromTeam(id, userId);
    return sendSuccess(res, result, 'Member removed from team successfully');
  } catch (error) {
    next(error);
  }
};

