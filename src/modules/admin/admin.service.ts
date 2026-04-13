import {
  User,
  TutorProfile,
  Booking,
  Review,
  
} from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const getAllUsersService = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  try {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        tutorProfile: true,
        _count: {
          select: {
            studentBookings: true,
            studentReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count({ where });

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
};

const updateUserStatusService = async (userId: string, status: string) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update user status",
    };
  }
};

const updateUserRoleService = async (userId: string, role: string) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update user role",
    };
  }
};

const deleteUserService = async (userId: string) => {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
};

const getAllTutorsService = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  try {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {};

    const tutors = await prisma.tutorProfile.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        subjects: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            slots: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.tutorProfile.count({ where });

    return {
      success: true,
      data: tutors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch tutors",
    };
  }
};

const approveTutorService = async (tutorId: string) => {
  try {
    const tutor = await prisma.tutorProfile.update({
      where: { id: tutorId },
      data: {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update user role to TUTOR if not already
    if (tutor.user.role !== "TUTOR") {
      await prisma.user.update({
        where: { id: tutor.userId },
        data: { role: "TUTOR" },
      });
    }

    return {
      success: true,
      data: tutor,
      message: "Tutor approved successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to approve tutor",
    };
  }
};

const rejectTutorService = async (tutorId: string) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: { user: true },
    });

    if (!tutor) {
      return {
        success: false,
        error: "Tutor not found",
      };
    }

    // Delete tutor profile
    await prisma.tutorProfile.delete({
      where: { id: tutorId },
    });

    // Optionally change user role back to USER
    await prisma.user.update({
      where: { id: tutor.userId },
      data: { role: "USER" },
    });

    return {
      success: true,
      message: "Tutor rejected and profile removed",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to reject tutor",
    };
  }
};

const getAnalyticsService = async () => {
  try {
    // User statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: "ACTIVE" },
    });
    const tutorUsers = await prisma.user.count({ where: { role: "TUTOR" } });

    // Booking statistics
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({
      where: { status: "COMPLETED" },
    });
    const cancelledBookings = await prisma.booking.count({
      where: { status: "CANCELLED" },
    });

    // Revenue statistics
    const revenueResult = await prisma.booking.aggregate({
      where: { status: "COMPLETED" },
      _sum: { price: true },
    });
    const totalRevenue = revenueResult._sum.price || 0;

    // Review statistics
    const totalReviews = await prisma.review.count();
    const avgRatingResult = await prisma.review.aggregate({
      _avg: { rating: true },
    });
    const avgRating = avgRatingResult._avg.rating || 0;

    // Recent bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const recentRevenueResult = await prisma.booking.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: "COMPLETED",
      },
      _sum: { price: true },
    });
    const recentRevenue = recentRevenueResult._sum.price || 0;

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          tutors: tutorUsers,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          recent: recentBookings,
        },
        revenue: {
          total: totalRevenue,
          recent: recentRevenue,
        },
        reviews: {
          total: totalReviews,
          averageRating: avgRating,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch analytics",
    };
  }
};

export const adminService = {
  getAllUsersService,
  updateUserStatusService,
  updateUserRoleService,
  deleteUserService,
  getAllTutorsService,
  approveTutorService,
  rejectTutorService,
  getAnalyticsService,
};
