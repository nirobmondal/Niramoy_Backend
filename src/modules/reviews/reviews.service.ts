import { OrderStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination } from "../../helpers/paginationSortingHelper";
import { calculateAverageRating } from "../../helpers/ratingHelper";
import { userRole } from "../../constant/role";
import {
  CreateReviewInput,
  ReviewQuery,
  UpdateReviewInput,
} from "./reviews.interface";

// ── Get All Reviews (admin) ──────────────────────────────────
const getAllReviews = async (query: ReviewQuery) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const parsedRating = Number(query.rating);

  const where = {
    ...(query.search && {
      OR: [
        {
          comment: {
            contains: query.search,
            mode: "insensitive" as const,
          },
        },
        {
          medicine: {
            name: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          user: {
            name: {
              contains: query.search,
              mode: "insensitive" as const,
            },
          },
        },
      ],
    }),
    ...(Number.isInteger(parsedRating) &&
      parsedRating >= 1 &&
      parsedRating <= 5 && {
        rating: parsedRating,
      }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        medicine: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get Reviews for a Medicine ────────────────────────────────
const getMedicineReviews = async (medicineId: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true },
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  const reviews = await prisma.review.findMany({
    where: { medicineId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = reviews.length;
  const averageRating = calculateAverageRating(reviews.map((r) => r.rating));

  return { reviews, averageRating, totalReviews };
};

// ── Create Review ─────────────────────────────────────────────
const createReview = async (
  userId: string,
  medicineId: string,
  data: CreateReviewInput,
) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true },
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  // Check if user already reviewed this medicine
  const existingReview = await prisma.review.findUnique({
    where: { userId_medicineId: { userId, medicineId } },
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this medicine", 409);
  }

  // User must have purchased and received the medicine (DELIVERED)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      medicineId,
      sellerOrder: {
        status: OrderStatus.DELIVERED,
        order: { customerId: userId },
      },
    },
    select: { id: true },
  });

  if (!hasPurchased) {
    throw new AppError(
      "You can only review medicines from delivered orders",
      403,
    );
  }

  const review = await prisma.review.create({
    data: {
      userId,
      medicineId,
      rating: data.rating,
      comment: data.comment ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return review;
};

// ── Update Review ─────────────────────────────────────────────
const updateReview = async (
  userId: string,
  reviewId: string,
  role: string,
  data: UpdateReviewInput,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.userId !== userId && role !== userRole.ADMIN) {
    throw new AppError("You are not authorized to update this review", 403);
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return updated;
};

// ── Delete Review ─────────────────────────────────────────────
const deleteReview = async (userId: string, role: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  // Owner or admin can delete
  if (review.userId !== userId && role !== userRole.ADMIN) {
    throw new AppError("You are not authorized to delete this review", 403);
  }

  await prisma.review.delete({ where: { id: reviewId } });
};

export const reviewService = {
  getAllReviews,
  getMedicineReviews,
  createReview,
  updateReview,
  deleteReview,
};
