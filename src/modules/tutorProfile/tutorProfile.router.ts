import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { tutorProfileController } from "./tutorProfile.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  tutorProfileController.createTutorProfile,
);
router.get(
  "/statistics",
  auth(UserRole.TUTOR),
  tutorProfileController.getStatistics,
);
router.get("/list", tutorProfileController.listTutors);
router.get("/:id", tutorProfileController.getTutorProfile);
router.get("/tutor/:id", tutorProfileController.getTutorProfileWithTutorId);
router.get(
  "/tutor/auth/:id",
  auth(UserRole.TUTOR, UserRole.ADMIN),
  tutorProfileController.getTutorProfileAuth,
);
router.put(
  "/:id",
  auth(UserRole.TUTOR),
  tutorProfileController.updateTutorProfile,
);

export const tutorProfileRouter = router;
