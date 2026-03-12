import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { orderController } from "./orders.controller";

const orderRouter = Router();

// All order routes require authenticated CUSTOMER
orderRouter.use(auth(userRole.CUSTOMER));

orderRouter.post("/", orderController.checkout);
orderRouter.get("/", orderController.getUserOrders);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.patch("/:id/cancel", orderController.cancelOrder);

export default orderRouter;