import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { availabilitySlotController } from "./availabilitySlot.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  availabilitySlotController.createAvailabilitySlot,
);

export const availabilitySlotRouter = router;
