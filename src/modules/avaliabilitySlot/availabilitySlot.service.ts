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

export const availabilitySlotService = {
  createAvailabilitySlot,
};
