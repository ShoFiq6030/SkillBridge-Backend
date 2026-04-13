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

const getAllBookings = async (
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
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Only admins can access all bookings!",
      });
    }

    const result = await bookingService.getAllBookingsService();
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatusByAdmin = async (
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
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Only admins can update booking status!",
      });
    }
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: "Booking ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    const result = await bookingService.updateBookingStatusByAdminService(
      bookingId as string,
      status,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (
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
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        error: "Booking ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        error: "Status is required",
      });
    }

    const result = await bookingService.updateBookingStatusService(
      bookingId as string,
      status,
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
  getAllBookings,
  updateBookingStatus,
  updateBookingStatusByAdmin,
};
