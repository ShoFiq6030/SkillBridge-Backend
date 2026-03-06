import { NextFunction, Request, Response } from "express";
import { ListTutorsFilters, tutorProfileService } from "./tutorProfile.service";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";


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

const listTutors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // extract search term if provided
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    // pagination & sorting helpers convert page/limit/skip/sort order
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    // parse numeric filters from query string values
    const rawCategory = req.query.category;
    const category = typeof rawCategory === "string" ? rawCategory : undefined;

    const rawMin = req.query.minHourlyRate;
    const rawMax = req.query.maxHourlyRate;
    const rawExp = req.query.experienceYears;

    const parsedMin = typeof rawMin === "string" ? Number(rawMin) : undefined;
    const parsedMax = typeof rawMax === "string" ? Number(rawMax) : undefined;
    const parsedExperience =
      typeof rawExp === "string" ? Number(rawExp) : undefined;

    const result = await tutorProfileService.listTutors({
      search: searchString,
      category,
      minHourlyRate: parsedMin,
      maxHourlyRate: parsedMax,
      experienceYears: parsedExperience,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const getTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const profileId = typeof id === "string" ? id : undefined;
    if (!profileId) {
      return res.status(400).json({
        error: "Tutor profile ID is required",
      });
    }

    const result = await tutorProfileService.getTutorProfile(profileId);
    if (!result) {
      return res.status(404).json({
        error: "Tutor profile not found",
      });
    }

    res.status(200).json({
       success: true,
      tutorProfile: result,
     
    });
  } catch (e) {
    next(e);
  }
};

export const tutorProfileController = {
  createTutorProfile,
  listTutors,
  getTutorProfile,
};
