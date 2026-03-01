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

export const tutorProfileService = {
  createTutorProfile,
};
