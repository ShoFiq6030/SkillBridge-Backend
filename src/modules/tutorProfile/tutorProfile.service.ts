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

  // Text search in headline or bio
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
    ];
  }

  // Price range filter – build a separate object so we don't spread undefined
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

export const tutorProfileService = {
  createTutorProfile,
  listTutors,
};
