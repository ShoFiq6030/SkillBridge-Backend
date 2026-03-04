import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { tutorSubjectController } from "./tutorSubject.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  tutorSubjectController.createTutorSubject,
);

export const tutorSubjectRouter = router;
