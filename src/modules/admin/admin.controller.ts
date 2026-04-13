import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";

// User Management APIs
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await adminService.getAllUsersService(page, limit, search);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "BANNED"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be ACTIVE or BANNED",
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    const result = await adminService.updateUserStatusService(
      userId as string,
      status,
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["USER", "TUTOR", "ADMIN"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Must be USER, TUTOR, or ADMIN",
      });
    }

    const result = await adminService.updateUserRoleService(
      userId as string,
      role,
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const result = await adminService.deleteUserService(userId as string);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Tutor Management APIs
const getAllTutors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await adminService.getAllTutorsService(page, limit, search);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const approveTutor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tutorId } = req.params;

    const result = await adminService.approveTutorService(tutorId as string);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const rejectTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorId } = req.params;

    const result = await adminService.rejectTutorService(tutorId as string);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Analytics API
const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.getAnalyticsService();
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllTutors,
  approveTutor,
  rejectTutor,
  getAnalytics,
};
