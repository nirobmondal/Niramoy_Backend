import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { reviewController } from "./reviews.controller";

const reviewRouter = Router();

// Update / delete own review (authenticated user)
reviewRouter.patch(
  "/:id",
  auth(userRole.CUSTOMER),
  reviewController.updateReview
);

reviewRouter.delete(
  "/:id",
  auth(userRole.CUSTOMER, userRole.ADMIN),
  reviewController.deleteReview
);

export default reviewRouter;