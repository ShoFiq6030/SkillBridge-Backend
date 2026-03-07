import { NextFunction, Request, Response } from "express";
import { availabilitySlotService } from "./availabilitySlot.service";

const createAvailabilitySlot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    if (user.role !== "TUTOR") {
      return res.status(400).json({
        error: "Only tutors can create availability slots!",
      });
    }
    const result = await availabilitySlotService.createAvailabilitySlot(
      req.body,
      user.id as string,
    );
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

const updateAvailabilitySlot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    if (user.role !== "TUTOR") {
      return res.status(400).json({
        error: "Only tutors can update availability slots!",
      });
    }

    const { slotId } = req.params;
    if (!slotId) {
      return res.status(400).json({
        success: false,
        error: "Slot ID is required",
      });
    }

    const result = await availabilitySlotService.updateAvailabilitySlot(
      slotId as string,
      req.body,
      user.id as string,
    );
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const deleteAvailabilitySlot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    if (user.role !== "TUTOR") {
      return res.status(400).json({
        error: "Only tutors can delete availability slots!",
      });
    }

    const { slotId } = req.params;
    if (!slotId) {
      return res.status(400).json({
        success: false,
        error: "Slot ID is required",
      });
    }

    const result = await availabilitySlotService.deleteAvailabilitySlot(
      slotId as string,
      user.id as string,
    );
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const availabilitySlotController = {
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
};
