import { Request, Response } from "express";
import { reviewService } from "./reviews.service";

const getMedicineReviews = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.getMedicineReviews(
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;

    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating is required and must be between 1 and 5",
      });
    }

    const review = await reviewService.createReview(
      req.user!.id,
      req.params.id as string,
      { rating, comment }
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create review",
    });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;

    if (rating != null && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const review = await reviewService.updateReview(
      req.user!.id,
      req.params.id as string,
      { rating, comment }
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update review",
    });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    await reviewService.deleteReview(
      req.user!.id,
      req.user!.role,
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete review",
    });
  }
};

export const reviewController = {
  getMedicineReviews,
  createReview,
  updateReview,
  deleteReview,
};