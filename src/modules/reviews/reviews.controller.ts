import { Request, Response } from "express";
import { reviewService } from "./reviews.service";
import { AppError } from "../../helpers/AppError";

const getAllReviews = async (req: Request, res: Response) => {
  const result = await reviewService.getAllReviews(
    req.query as {
      page?: string;
      limit?: string;
      search?: string;
      rating?: string;
    },
  );

  res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getMedicineReviews = async (req: Request, res: Response) => {
  const result = await reviewService.getMedicineReviews(
    req.params.id as string,
  );

  res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
};

const createReview = async (req: Request, res: Response) => {
  const { rating, comment } = req.body;

  if (rating == null || rating < 1 || rating > 5) {
    throw new AppError("Rating is required and must be between 1 and 5", 400);
  }

  const review = await reviewService.createReview(
    req.user!.id,
    req.params.id as string,
    { rating, comment },
  );

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: review,
  });
};

const updateReview = async (req: Request, res: Response) => {
  const { rating, comment } = req.body;

  if (rating != null && (rating < 1 || rating > 5)) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  const review = await reviewService.updateReview(
    req.user!.id,
    req.params.id as string,
    req.user!.role,
    { rating, comment },
  );

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: review,
  });
};

const deleteReview = async (req: Request, res: Response) => {
  await reviewService.deleteReview(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
};

export const reviewController = {
  getAllReviews,
  getMedicineReviews,
  createReview,
  updateReview,
  deleteReview,
};
