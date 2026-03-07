import { success } from "better-auth/*";
import { AvailabilitySlot } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const createAvailabilitySlot = async (
  payload: AvailabilitySlot,
  userId: string,
) => {
  // Resolve the tutor profile for this user, then create a slot linked to that profile
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });
  if (!tutorProfile) {
    return {
      success: false,
      error: "Tutor profile not found for user",
    };
  }

  // check if the tutor already has a slot that overlaps with the new slot

  const existingSlots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId: tutorProfile.id,
    },
  });

  payload.startAt = new Date(payload.startAt);
  payload.endAt = new Date(payload.endAt);

  for (const slot of existingSlots) {
    if (payload.startAt < slot.endAt && payload.endAt > slot.startAt) {
      return {
        success: false,
        error: "Overlapping availability slots are not allowed",
      };
    }
    if (payload.startAt === slot.startAt && payload.endAt === slot.endAt) {
      return {
        success: false,
        error: "Duplicate availability slots are not allowed",
      };
    }
  }
  // check if the start time is before the end time
  if (payload.startAt >= payload.endAt) {
    return {
      success: false,
      error: "Start time must be before end time",
    };
  }
  // check if the start time is in the past
  if (payload.startAt < new Date()) {
    return {
      success: false,
      error: "Start time must be in the future",
    };
  }

  const result = await prisma.availabilitySlot.create({
    data: {
      ...payload,
      tutorProfileId: tutorProfile.id,
    },
  });
  return {
    success: true,
    data: result,
  };
};

const updateAvailabilitySlot = async (
  slotId: string,
  payload: Partial<AvailabilitySlot>,
  userId: string,
) => {
  // Get the slot to check ownership
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      tutorProfile: {
        select: { userId: true },
      },
    },
  });

  if (!slot) {
    return {
      success: false,
      error: "Availability slot not found",
    };
  }

  // Check if the tutor is updating their own slot
  if (slot.tutorProfile.userId !== userId) {
    return {
      success: false,
      error: "You can only update your own availability slots",
    };
  }

  // Check if slot is already booked - can't update if booked
  if (slot.isBooked) {
    return {
      success: false,
      error: "Cannot update a booked availability slot",
    };
  }

  // If updating times, validate them
  const startAt = payload.startAt ? new Date(payload.startAt) : slot.startAt;
  const endAt = payload.endAt ? new Date(payload.endAt) : slot.endAt;

  // Check if the start time is before the end time
  if (startAt >= endAt) {
    return {
      success: false,
      error: "Start time must be before end time",
    };
  }

  // Check if the start time is in the past
  if (startAt < new Date()) {
    return {
      success: false,
      error: "Start time must be in the future",
    };
  }

  // Check for overlapping slots (excluding current slot)
  const existingSlots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId: slot.tutorProfileId,
      id: {
        not: slotId,
      },
    },
  });

  for (const existingSlot of existingSlots) {
    if (startAt < existingSlot.endAt && endAt > existingSlot.startAt) {
      return {
        success: false,
        error: "Overlapping availability slots are not allowed",
      };
    }
  }

  const result = await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: {
      startAt,
      endAt,
    },
  });

  return {
    success: true,
    message: "Availability slot updated successfully",
    data: result,
  };
};

export const availabilitySlotService = {
  createAvailabilitySlot,
  updateAvailabilitySlot,
};
