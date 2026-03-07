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
    return tutorSubject;
  } catch (error) {
    console.error("Error creating tutor subject:", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
};

const getTutorSubject = async (tutorProfileId: string) => {
  try {
    const tutorSubject = await prisma.tutorSubject.findMany({
      where: {
        tutorProfileId,
      },
      include: {
        category: true,
        tutorProfile: true,
      },
    });
    return tutorSubject;
  } catch (error) {
    console.error("Error fetching tutor subject:", error);
    return null;
  }
};

const getTutorSubjectById = async (id: string) => {
  try {
    const tutorSubject = await prisma.tutorSubject.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
        tutorProfile: true,
      },
    });
    return tutorSubject;
  } catch (error) {
    console.error("Error fetching tutor subject:", error);
    return null;
  }
};

const deleteTutorSubject = async (id: string, userId: string) => {
  try {
    // fetch the subject along with its tutor profile to verify ownership
    const subject = await prisma.tutorSubject.findUnique({
      where: { id },
      include: { tutorProfile: true },
    });
    if (!subject) {
      return { success: false, message: "Tutor subject not found" };
    }
    if (subject.tutorProfile.userId !== userId) {
      return {
        success: false,
        message: "Not authorized to delete this subject",
      };
    }

    await prisma.tutorSubject.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting tutor subject:", error);
    return { success: false, message: "Internal server error" };
  }
};

export const tutorSubjectService = {
  createTutorSubject,
  getTutorSubject,
  getTutorSubjectById,
  deleteTutorSubject,
};
