import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { reviewController } from "./reviews.controller";

const reviewRouter = Router();

// Admin review management list
reviewRouter.get("/", auth(userRole.ADMIN), reviewController.getAllReviews);

// Update / delete own review (authenticated user and admin)
reviewRouter.patch(
  "/:id",
  auth(userRole.CUSTOMER, userRole.ADMIN),
  reviewController.updateReview,
);

reviewRouter.delete(
  "/:id",
  auth(userRole.CUSTOMER, userRole.ADMIN),
  reviewController.deleteReview,
);

export default reviewRouter;
