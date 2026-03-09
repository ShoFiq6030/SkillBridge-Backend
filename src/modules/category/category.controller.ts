import { NextFunction, Request, Response } from "express";
import { categoriesService } from "./category.service";

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    if (user.role !== "TUTOR" && user.role !== "ADMIN") {
      return res.status(400).json({
        error: "Only admins and tutors can create categories!",
      });
    }
    const result = await categoriesService.createCategory(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || "Failed to create category",
      });
    }
    res.status(201).json({
      success: true,
      data: result.data,
    });
  } catch (e) {
    next(e);
  }
};

const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoriesService.getAllCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (e) {
    next(e);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    if (user.role !== "ADMIN") {
      return res.status(400).json({
        error: "Only admins  can update categories!",
      });
    }
    const { id } = req.params;
    const result = await categoriesService.updateCategory(
      id as string,
      req.body,
    );
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || "Failed to update category",
      });
    }
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (e) {
    next(e);
  }
};

export const categoriesController = {
  createCategory,
  getAllCategories,
  updateCategory,
};
