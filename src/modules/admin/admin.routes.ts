import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = express.Router();

// User Management Routes
router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.patch(
  "/users/:userId/status",
  auth(UserRole.ADMIN),
  adminController.updateUserStatus,
);
router.patch(
  "/users/:userId/role",
  auth(UserRole.ADMIN),
  adminController.updateUserRole,
);
router.delete(
  "/users/:userId",
  auth(UserRole.ADMIN),
  adminController.deleteUser,
);

// Tutor Management Routes
router.get("/tutors", auth(UserRole.ADMIN), adminController.getAllTutors);
router.patch(
  "/tutors/:tutorId/approve",
  auth(UserRole.ADMIN),
  adminController.approveTutor,
);
router.delete(
  "/tutors/:tutorId/reject",
  auth(UserRole.ADMIN),
  adminController.rejectTutor,
);

// Analytics Route
router.get("/analytics", auth(UserRole.ADMIN), adminController.getAnalytics);



export const adminRouter = router;
