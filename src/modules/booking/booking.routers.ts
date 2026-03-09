import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { bookingController } from "./booking.controller";

const router = express.Router();

router.post("/", auth(UserRole.USER), bookingController.createBooking);
router.get("/", auth(UserRole.USER), bookingController.getBookingsByStudentId);
router.patch(
  "/:bookingId/status",
  auth(UserRole.TUTOR),
  bookingController.updateBookingStatus,
);

export const bookingRouter = router;
