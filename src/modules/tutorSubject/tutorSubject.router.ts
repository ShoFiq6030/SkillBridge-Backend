import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { tutorSubjectController } from "./tutorSubject.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  tutorSubjectController.createTutorSubject,
);

router.get("/:tutorProfileId", tutorSubjectController.getTutorSubject);

router.get("/single/:id", tutorSubjectController.getTutorSubjectById);

router.delete(
  "/:id",
  auth(UserRole.TUTOR),
  tutorSubjectController.deleteTutorSubject,
);

export const tutorSubjectRouter = router;
