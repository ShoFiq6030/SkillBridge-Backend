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
    console.log((e as Error).message);
    res.status(500).json({
      success: false,
      error: (e as Error).message || "Failed to create category",
    });
  }
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoriesService.getAllCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (e) {
    console.log((e as Error).message);
    res.status(500).json({
      success: false,
      error: (e as Error).message || "Failed to fetch categories",
    });
  }
};

export const categoriesController = {
  createCategory,
  getAllCategories,
};
