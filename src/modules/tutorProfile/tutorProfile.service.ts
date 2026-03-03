import { TutorProfile } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const createTutorProfile = async (payload: TutorProfile, userId: string) => {
  const result = await prisma.tutorProfile.create({
    data: {
      ...payload,
      userId,
    },
  });
  return result;
};
const getAllTutorProfile = async () => {
  const result = await prisma.tutorProfile.findMany({
    include: {
      user: true,
      slots: true,
    },
    where: {
      user: {
        status: "ACTIVE",
      },
    },
  });
  return result;
};

export const tutorProfileService = {
  createTutorProfile,
  getAllTutorProfile,
};
