import { OrderStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

// ── Get Reviews for a Medicine ────────────────────────────────
const getMedicineReviews = async (medicineId: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true },
  });

  if (!medicine) {
    throw Object.assign(new Error("Medicine not found"), { statusCode: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: { medicineId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
        ) / 10
      : 0;

  return { reviews, averageRating, totalReviews };
};

// ── Create Review ─────────────────────────────────────────────
const createReview = async (
  userId: string,
  medicineId: string,
  data: { rating: number; comment?: string }
) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { id: true },
  });

  if (!medicine) {
    throw Object.assign(new Error("Medicine not found"), { statusCode: 404 });
  }

  // Check if user already reviewed this medicine
  const existingReview = await prisma.review.findUnique({
    where: { userId_medicineId: { userId, medicineId } },
  });

  if (existingReview) {
    throw Object.assign(
      new Error("You have already reviewed this medicine"),
      { statusCode: 409 }
    );
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
    throw Object.assign(
      new Error(
        "You can only review medicines from delivered orders"
      ),
      { statusCode: 403 }
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
  data: { rating?: number; comment?: string }
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw Object.assign(new Error("Review not found"), { statusCode: 404 });
  }

  if (review.userId !== userId) {
    throw Object.assign(
      new Error("You are not authorized to update this review"),
      { statusCode: 403 }
    );
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
const deleteReview = async (
  userId: string,
  userRole: string,
  reviewId: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw Object.assign(new Error("Review not found"), { statusCode: 404 });
  }

  // Owner or admin can delete
  if (review.userId !== userId && userRole !== "AMDIN") {
    throw Object.assign(
      new Error("You are not authorized to delete this review"),
      { statusCode: 403 }
    );
  }

  await prisma.review.delete({ where: { id: reviewId } });
};

export const reviewService = {
  getMedicineReviews,
  createReview,
  updateReview,
  deleteReview,
};