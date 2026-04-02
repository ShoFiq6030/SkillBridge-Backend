import { Review, ReviewStatus } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string | null;
}

interface UpdateReviewStatusDto {
  status: ReviewStatus;
}

const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

const createReview = async (
  dto: CreateReviewDto,
  studentId: string
): Promise<Review> => {
  // Validate rating
  if (!validateRating(dto.rating)) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  // Check if booking exists and is completed
  const booking = await prisma.booking.findUnique({
    where: { id: dto.bookingId },
    include: {
      student: true,
      tutorProfile: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Verify the student is the one who made the booking
  if (booking.studentId !== studentId) {
    throw new Error("You can only review your own bookings");
  }

  // Check if booking is completed
  if (booking.status !== "COMPLETED") {
    throw new Error("You can only review completed bookings");
  }

  // Check if a review already exists for this booking
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: dto.bookingId },
  });

  if (existingReview) {
    throw new Error("A review already exists for this booking");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      tutorProfileId: booking.tutorProfileId,
      studentId: studentId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      comment: dto.comment ?? null,
      status: "PENDING",
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutorProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      booking: {
        include: {
          tutorSubject: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  // Update tutor profile's average rating and total reviews
  await updateTutorProfileRating(booking.tutorProfileId);

  return review;
};

const updateTutorProfileRating = async (tutorProfileId: string) => {
  // Calculate new average rating and total reviews
  const reviews = await prisma.review.findMany({
    where: {
      tutorProfileId,
      status: "APPROVED",
    },
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  // Update tutor profile
  await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      totalReviews,
    },
  });
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutorProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      booking: {
        include: {
          tutorSubject: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

const getReviewsByTutorProfile = async (
  tutorProfileId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        tutorProfileId,
        status: "APPROVED",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        booking: {
          include: {
            tutorSubject: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: {
        tutorProfileId,
        status: "APPROVED",
      },
    }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getReviewsByStudent = async (
  studentId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
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
                image: true,
              },
            },
          },
        },
        booking: {
          include: {
            tutorSubject: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: {
        studentId,
      },
    }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateReviewStatus = async (
  reviewId: string,
  status: ReviewStatus,
  reviewerId: string,
  reviewerRole: string
): Promise<Review> => {
  // Only admin or tutor can update review status
  if (reviewerRole !== "ADMIN" && reviewerRole !== "TUTOR") {
    throw new Error("Only admin or tutor can update review status");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // If tutor, they can only update reviews for their own profile
  if (reviewerRole === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: reviewerId },
    });

    if (!tutorProfile || tutorProfile.id !== review.tutorProfileId) {
      throw new Error("You can only update reviews for your own profile");
    }
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { status },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      tutorProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      booking: {
        include: {
          tutorSubject: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  // If status changed to APPROVED or REJECTED, update tutor profile rating
  if (status === "APPROVED" || status === "REJECTED") {
    await updateTutorProfileRating(review.tutorProfileId);
  }

  return updatedReview;
};

const deleteReview = async (reviewId: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Only the student who wrote the review or admin can delete it
  if (userRole !== "ADMIN" && review.studentId !== userId) {
    throw new Error("You can only delete your own reviews");
  }

  const tutorProfileId = review.tutorProfileId;

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update tutor profile rating after deletion
  await updateTutorProfileRating(tutorProfileId);

  return { success: true, message: "Review deleted successfully" };
};

export const reviewsService = {
  createReview,
  getReviewById,
  getReviewsByTutorProfile,
  getReviewsByStudent,
  updateReviewStatus,
  deleteReview,
};