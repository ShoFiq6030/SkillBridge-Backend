import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { bookingController } from "./booking.controller";

const router = express.Router();

router.post("/", auth(UserRole.USER), bookingController.createBooking);
router.get("/", auth(UserRole.USER), bookingController.getBookingsByStudentId);
router.get("/admin", auth(UserRole.ADMIN), bookingController.getAllBookings);
router.get("/user-booked-slots/:tutorId", auth(UserRole.USER), bookingController.getUserBookedSlotsOfTutor);
router.patch(
  "/admin/status/:bookingId",
  auth(UserRole.ADMIN),
  bookingController.updateBookingStatusByAdmin,
);
router.patch(
  "/status/:bookingId",
  auth(UserRole.TUTOR),
  bookingController.updateBookingStatus,
);

export const bookingRouter = router;
