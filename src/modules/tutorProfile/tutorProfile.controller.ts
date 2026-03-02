import { NextFunction, Request, Response } from "express";
import { tutorProfileService } from "./tutorProfile.service";

const createTutorProfile = async (
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
    if (user.role !== "TUTOR") {
      return res.status(400).json({
        error: "Only tutors can create tutor profiles!",
      });
    }
    const result = await tutorProfileService.createTutorProfile(
      req.body,
      user.id as string,
    );
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

const getAllTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const { search } = req.query
    // const searchString = typeof search === 'string' ? search : undefined

    const result = await tutorProfileService.getAllTutorProfile();
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const tutorProfileController = {
  createTutorProfile,
  getAllTutorProfile,
};
