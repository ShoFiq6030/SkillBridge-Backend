import { TutorSubject } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const createTutorSubject = async (categoryId: string, userId: string) => {
  try {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!tutorProfile) {
      return {
        success: false,
        message: "Tutor profile not found for the user",
      };
    }

    const tutorSubject = await prisma.tutorSubject.create({
      data: {
        tutorProfileId: tutorProfile.id,
        categoryId: categoryId,
      },
    });
    return tutorSubject
  } catch (error) {
    console.error("Error creating tutor subject:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
};

export const tutorSubjectService = {
  createTutorSubject,
};
