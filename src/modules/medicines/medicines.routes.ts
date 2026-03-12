import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { medicineController } from "./medicines.controller";
import { reviewController } from "../reviews/reviews.controller";

const medicineRouter = Router();

// Public routes
medicineRouter.get("/", medicineController.getAllMedicines);
medicineRouter.get("/:id", medicineController.getMedicineById);

// Review routes on medicine
medicineRouter.get("/:id/reviews", reviewController.getMedicineReviews);
medicineRouter.post(
  "/:id/reviews",
  auth(userRole.CUSTOMER),
  reviewController.createReview
);

export default medicineRouter;