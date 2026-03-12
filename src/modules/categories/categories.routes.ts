import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { categoryController } from "./categories.controller";

const categoryRouter = Router();

// Public routes
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:id/medicines", categoryController.getCategoryWithMedicines);

// Admin-only routes
categoryRouter.post("/", auth(userRole.ADMIN), categoryController.createCategory);
categoryRouter.patch("/:id", auth(userRole.ADMIN), categoryController.updateCategory);
categoryRouter.delete("/:id", auth(userRole.ADMIN), categoryController.deleteCategory);

export default categoryRouter;