import { Request, Response } from "express";
import { tutorSubjectService } from "./tutorSubject.service";

const createTutorSubject = async (req: Request, res: Response) => {
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
    console.error("Error creating tutor subject:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTutorSubject = async (req: Request, res: Response) => {
  try {
    const { tutorProfileId } = req.params;
    const result = await tutorSubjectService.getTutorSubject(tutorProfileId as string);
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
    console.error("Error fetching tutor subject:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const tutorSubjectController = {
  createTutorSubject,
  getTutorSubject,
};
