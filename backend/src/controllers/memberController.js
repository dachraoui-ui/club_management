import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import * as memberService from '../services/memberService.js';

/**
 * Get all members
 */
export const getAllMembers = async (req, res, next) => {
  try {
    const result = await memberService.getAllMembers(req.query);
    return sendPaginated(res, result.members, result.pagination, 'Members retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get member by ID
 */
export const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await memberService.getMemberById(id);
    return sendSuccess(res, member, 'Member retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create member
 */
export const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body);
    return sendSuccess(res, member, 'Member created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update member
 */
export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await memberService.updateMember(id, req.body);
    return sendSuccess(res, member, 'Member updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update member status
 */
export const updateMemberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const member = await memberService.updateMemberStatus(id, status);
    return sendSuccess(res, member, 'Member status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete member
 */
export const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await memberService.deleteMember(id);
    return sendSuccess(res, result, 'Member deleted successfully');
  } catch (error) {
    next(error);
  }
};

