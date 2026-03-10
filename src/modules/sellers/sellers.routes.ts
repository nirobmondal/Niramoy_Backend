import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { sellerController } from "./sellers.controller";

const sellerRouter = Router();

// All routes require authenticated SELLER
sellerRouter.use(auth(userRole.SELLER));

// Medicine management
sellerRouter.post("/medicines", sellerController.addMedicine);
sellerRouter.patch("/medicines/:id", sellerController.editMedicine);
sellerRouter.delete("/medicines/:id", sellerController.removeMedicine);
sellerRouter.patch("/medicines/:id/stock", sellerController.updateStock);

// Order management
sellerRouter.get("/orders", sellerController.getOrders);
sellerRouter.patch("/orders/:id/status", sellerController.updateOrderStatus);

export default sellerRouter;
