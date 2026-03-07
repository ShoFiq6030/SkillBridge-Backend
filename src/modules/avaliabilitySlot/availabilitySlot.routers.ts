import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { availabilitySlotController } from "./availabilitySlot.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  availabilitySlotController.createAvailabilitySlot,
);

router.put(
  "/:slotId",
  auth(UserRole.TUTOR),
  availabilitySlotController.updateAvailabilitySlot,
);

router.delete(
  "/:slotId",
  auth(UserRole.TUTOR),
  availabilitySlotController.deleteAvailabilitySlot,
);

export const availabilitySlotRouter = router;
