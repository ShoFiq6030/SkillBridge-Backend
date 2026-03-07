import { Booking } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const createBookingService = async (bookingData: Booking, userId: string) => {
  try {
    const { slotId, tutorSubjectId, note } = bookingData;
    const slotDetails = await prisma.availabilitySlot.findUnique({
      where: {
        id: slotId,
      },
    });
    if (!slotDetails) {
      return {
        success: false,
        error: "Invalid slot ID",
      };
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: userId,
        tutorProfileId: slotDetails.tutorProfileId,
        slotId,
        tutorSubjectId,
        note,
      },
    });
    if (!booking) {
      return {
        success: false,
        error: "Failed to create booking",
      };
    }
    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: (error as Error).message || "Failed to create booking",
    };
  }
};

const getBookingsByStudentIdService = async (studentId: string) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        studentId,
      },
      include: {
        tutorProfile: true,
        slot: true,
        tutorSubject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      success: true,
      data: bookings,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: (error as Error).message || "Failed to fetch bookings",
    };
  }
};

export const bookingService = {
  createBookingService,
  getBookingsByStudentIdService,
};
