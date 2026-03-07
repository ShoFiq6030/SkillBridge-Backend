import { Request, Response, NextFunction } from "express";
import { tutorSubjectService } from "./tutorSubject.service";

const createTutorSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { categoryId } = req.body;
    const result = await tutorSubjectService.createTutorSubject(
      categoryId,
      user.id,
    );
    if (!result || (result as any).success === false) {
      return res.status(400).json({
        success: false,
        message: (result as any).message || "Failed to create tutor subject",
      });
    }
    res.status(201).json({
      success: true,
      message: "Tutor subject created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTutorSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorProfileId } = req.params;
    const result = await tutorSubjectService.getTutorSubject(
      tutorProfileId as string,
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Tutor subject not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tutor subject retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTutorSubjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await tutorSubjectService.getTutorSubjectById(id as string);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Tutor subject not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tutor subject retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTutorSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const result = await tutorSubjectService.deleteTutorSubject(
      id as string,
      user.id,
    );
    if (!result.success) {
      const status = result.message === "Tutor subject not found" ? 404 : 403;
      return res
        .status(status)
        .json({ success: false, message: result.message });
    }
    res
      .status(200)
      .json({ success: true, message: "Tutor subject deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const tutorSubjectController = {
  createTutorSubject,
  getTutorSubject,
  getTutorSubjectById,
  deleteTutorSubject,
};
 
