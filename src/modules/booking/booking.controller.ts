import { Request, Response } from "express";
import { bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
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
    console.log(error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || "Failed to create booking",
    });
  }
};

export const bookingController = {
  createBooking,
};
