import { NextFunction, Request, Response } from "express";
import { reviewsService } from "./reviews.service";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: "Booking ID is required",
      });
    }

    if (rating === undefined) {
      return res.status(400).json({
        error: "Rating is required",
      });
    }

    const result = await reviewsService.createReview(
      {
        bookingId,
        rating,
        comment,
      },
      user.id as string,
    );

    res.status(201).json({
      success: true,
      message:
        "Review submitted successfully. It will be published after approval.",
      review: result,
    });
  } catch (e: any) {
    next(e);
  }
};
const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: "Review ID is required",
      });
    }

    const { rating, comment } = req.body;

    const result = await reviewsService.updateReviewService(
      id as string,
      { rating, comment },
      user.id as string,
    );

    res.status(200).json({
      success: true,
      review: result,
    });
  } catch (e: any) {
    next(e);
  }
};

const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : (id as string);

    if (!reviewId) {
      return res.status(400).json({
        error: "Review ID is required",
      });
    }

    const result = await reviewsService.getReviewById(reviewId);

    res.status(200).json({
      success: true,
      review: result,
    });
  } catch (e: any) {
    next(e);
  }
};

const getReviewsByTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tutorProfileId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!tutorProfileId) {
      return res.status(400).json({
        error: "Tutor profile ID is required",
      });
    }

    const result = await reviewsService.getReviewsByTutorProfile(
      tutorProfileId as string,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    next(e);
  }
};

const getMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await reviewsService.getReviewsByStudent(
      user.id as string,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    next(e);
  }
};

const updateReviewStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : (id as string);

    if (!reviewId) {
      return res.status(400).json({
        error: "Review ID is required",
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    const result = await reviewsService.updateReviewStatus(
      reviewId,
      status,
      user.id as string,
      user.role as string,
    );

    res.status(200).json({
      success: true,
      message: "Review status updated successfully",
      review: result,
    });
  } catch (e: any) {
    next(e);
  }
};

const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized!",
      });
    }

    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : (id as string);

    if (!reviewId) {
      return res.status(400).json({
        error: "Review ID is required",
      });
    }

    const result = await reviewsService.deleteReview(
      reviewId,
      user.id as string,
      user.role as string,
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (e: any) {
    next(e);
  }
};

export const reviewsController = {
  createReview,
  getReviewById,
  getReviewsByTutorProfile,
  getMyReviews,
  updateReviewStatus,
  deleteReview,
  updateReview,
};
