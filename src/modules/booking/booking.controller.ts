import { Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";

const createBooking = async (
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
    const result = await bookingService.createBookingService(
      req.body,
      user.id as string,
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getBookingsByStudentId = async (
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
    const result = await bookingService.getBookingsByStudentIdService(
      user.id as string,
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const bookingController = {
  createBooking,
  getBookingsByStudentId,
};
