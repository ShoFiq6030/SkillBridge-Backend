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

export interface ListTutorsFilters {
  search?: string | undefined;
  category?: string | undefined;
  minHourlyRate?: number | undefined;
  maxHourlyRate?: number | undefined;
  experienceYears?: number | undefined;
  sortBy: string;
  sortOrder: string;
  skip?: number;
  page?: number;
  limit?: number;
}

const listTutors = async (filters: ListTutorsFilters) => {
  const {
    search,
    category,
    minHourlyRate,
    maxHourlyRate,
    experienceYears,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10,
    skip = 0,
  } = filters;

  const where: any = {
    user: {
      status: "ACTIVE",
    },
  };

  // Text search in headline , bio and name
  if (search) {
    where.OR = [
      {
        headline: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        bio: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const rateFilter: any = {};
  if (minHourlyRate !== undefined && !isNaN(minHourlyRate)) {
    rateFilter.gte = minHourlyRate;
  }
  if (maxHourlyRate !== undefined && !isNaN(maxHourlyRate)) {
    rateFilter.lte = maxHourlyRate;
  }
  if (Object.keys(rateFilter).length) {
    where.hourlyRate = rateFilter;
  }

  // Experience filter (gte)
  if (experienceYears !== undefined && !isNaN(experienceYears)) {
    where.experienceYears = {
      gte: experienceYears,
    };
  }

  // Category filter via TutorSubject join table
  if (category) {
    where.subjects = {
      some: {
        category: {
          slug: {
            contains: category,
            mode: "insensitive",
          },
        },
      },
    };
  }

  const [data, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        subjects: {
          include: {
            category: true,
          },
        },
        slots: true,

        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.tutorProfile.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTutorProfile = async (id: string) => {
  const result = await prisma.tutorProfile.findUnique({
    where: {
      userId: id,
      user: {
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
      subjects: {
        include: {
          category: true,
        },
      },
      slots: {
        where: {
          startAt: {
            gte: new Date(),
          },
          isBooked: false,
        },
      },

      reviews: {
        select: {
          id: true,
          rating: true,
        },
      },
    },
  });

  return result;
};
const getTutorProfileAuth = async (id: string) => {
  const result = await prisma.tutorProfile.findUnique({
    where: {
      userId: id,
      user: {
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
      subjects: {
        include: {
          category: true,
        },
      },
      slots: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          bookingId: true,
          createdAt: true,
          updatedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      bookings: {
        include: {
          student: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return result;
};
const getTutorProfileWithTutorId = async (id: string) => {
  // console.log(id)
  const result = await prisma.tutorProfile.findUnique({
    where: {
      id: id,
      user: {
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
      subjects: {
        include: {
          category: true,
        },
      },
      slots: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          bookingId: true,
          createdAt: true,
          updatedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const updateTutorProfile = async (
  profileId: string,
  userId: string,
  payload: Partial<TutorProfile>,
) => {
  // Verify that the profile belongs to the user
  const existingProfile = await prisma.tutorProfile.findUnique({
    where: {
      id: profileId,
      userId: userId,
    },
  });

  if (!existingProfile || existingProfile.userId !== userId) {
    return null;
  }

  const result = await prisma.tutorProfile.update({
    where: {
      id: profileId,
    },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
      subjects: {
        include: {
          category: true,
        },
      },
      slots: true,
      reviews: {
        select: {
          id: true,
          rating: true,
        },
      },
    },
  });

  return result;
};

const getStatistics = async (userId: string) => {
  // console.log(userId);
  const tutorId = await prisma.tutorProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });
  if (!tutorId) {
    throw new Error("Tutor profile not found");
  }
  // console.log(tutorId)

  const totalBookings = await prisma.booking.count({
    where: {
      tutorProfileId: tutorId?.id,
    },
  });
  // console.log("totalBookings", totalBookings);
  const completedBookings = await prisma.booking.count({
    where: {
      tutorProfileId: tutorId?.id,
      status: "COMPLETED",
    },
  });

  const averageRating = await prisma.review.aggregate({
    where: {
      tutorProfileId: tutorId?.id,
    },
    _avg: {
      rating: true,
    },
  });

  const totalEarningsResult = await prisma.booking.aggregate({
    where: {
      tutorProfileId: tutorId?.id,
      status: "COMPLETED",
    },
    _sum: {
      price: true,
    },
  });
  // console.log(
  //   totalBookings,
  //   completedBookings,
  //   averageRating,
  //   totalEarningsResult,
  // );

  return {
    totalBookings,
    completedBookings,
    averageRating: averageRating._avg.rating || 0,
    totalEarnings: totalEarningsResult._sum.price || 0,
  };
};

export const tutorProfileService = {
  createTutorProfile,
  listTutors,
  getTutorProfile,
  updateTutorProfile,
  getTutorProfileWithTutorId,
  getTutorProfileAuth,
  getStatistics,
};
