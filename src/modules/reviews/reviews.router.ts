import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import {
  reviewsController,
} from "./reviews.controller";

const router = express.Router();

// Create a review (any authenticated user, but service validates student ownership)
router.post(
  "/",
  auth(),
  reviewsController.createReview
);

// Get review by ID (public - approved reviews only)
router.get("/:id", reviewsController.getReviewById);

// Get all reviews for a tutor profile (public - approved reviews only)
router.get("/tutor/:tutorProfileId", reviewsController.getReviewsByTutorProfile);

// Get my reviews (authenticated users)
router.get("/my/reviews", auth(), reviewsController.getMyReviews);

// Update review status (admin or tutor) - for approving/rejecting reviews
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.TUTOR),
  reviewsController.updateReviewStatus
);
router.patch(
  "/:id",
  auth(UserRole.USER, ),
  reviewsController.updateReview
);

// Delete review (authenticated users, service validates ownership)
router.delete(
  "/:id",
  auth(),
  reviewsController.deleteReview
);

export const reviewsRouter = router;