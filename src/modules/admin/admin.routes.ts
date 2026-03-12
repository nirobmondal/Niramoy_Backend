import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { adminController } from "./admin.controller";

const adminRouter = Router();

// All admin routes require ADMIN role
adminRouter.use(auth(userRole.ADMIN));

adminRouter.get("/dashboard", adminController.getDashboard);
adminRouter.get("/users", adminController.getUsers);
adminRouter.patch("/users/:id/ban", adminController.toggleBan);
adminRouter.get("/orders", adminController.getOrders);
adminRouter.get("/medicines", adminController.getMedicines);

export default adminRouter;