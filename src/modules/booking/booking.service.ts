import { Booking, BookingStatus } from "../../../generated/prisma";
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
    const slotDuration = slotDetails.duration;
    const tutorHourlyRate = await prisma.tutorProfile.findUnique({
      where: {
        id: slotDetails.tutorProfileId,
      },
      select: {
        hourlyRate: true,
      },
    });

    const totalPrice = (tutorHourlyRate?.hourlyRate || 0) * slotDuration;

    const booking = await prisma.booking.create({
      data: {
        studentId: userId,
        tutorProfileId: slotDetails.tutorProfileId,
        slotId,
        tutorSubjectId,
        note,
        price: totalPrice,
      },
    });
    if (!booking) {
      return {
        success: false,
        error: "Failed to create booking",
      };
    }
    // update the slot to mark it as booked
    await prisma.availabilitySlot.update({
      where: {
        id: slotId,
      },
      data: {
        isBooked: true,
      },
    });

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
        tutorProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        slot: true,
        tutorSubject: {
          select: {
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        review: true,
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

const updateBookingStatusService = async (
  bookingId: string,
  status: BookingStatus,
  userId: string,
) => {
  try {
    // Validate status
    if (!["COMPLETED", "CANCELLED"].includes(status)) {
      return {
        success: false,
        error: "Status can only be COMPLETED or CANCELLED",
      };
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: {
        userId,
      },
    });

    // Find booking
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        tutorProfile: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (!tutorProfile || booking.tutorProfileId !== tutorProfile.id) {
      return {
        success: false,
        error: "Only the tutor of this booking can update its status",
      };
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status,
      },
      include: {
        tutorProfile: true,
        slot: true,
        tutorSubject: true,
      },
    });

    return {
      success: true,
      data: updatedBooking,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: (error as Error).message || "Failed to update booking status",
    };
  }
};

export const bookingService = {
  createBookingService,
  getBookingsByStudentIdService,
  updateBookingStatusService,
};
