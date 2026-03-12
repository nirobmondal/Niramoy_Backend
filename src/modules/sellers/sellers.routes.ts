import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { sellerController } from "./sellers.controller";

const sellerRouter = Router();

// Create seller profile (any authenticated user can become a seller)
sellerRouter.post(
  "/profile",
  auth(userRole.CUSTOMER),
  sellerController.createSellerProfile
);

// All routes below require authenticated SELLER
sellerRouter.use(auth(userRole.SELLER));

// Seller profile
sellerRouter.get("/profile", sellerController.getSellerProfile);
sellerRouter.patch("/profile", sellerController.updateSellerProfile);

// Medicine management
sellerRouter.get("/medicines", sellerController.getSellerMedicines);
sellerRouter.post("/medicines", sellerController.addMedicine);
sellerRouter.patch("/medicines/:id", sellerController.editMedicine);
sellerRouter.delete("/medicines/:id", sellerController.removeMedicine);
sellerRouter.patch("/medicines/:id/stock", sellerController.updateStock);

// Order management
sellerRouter.get("/orders", sellerController.getOrders);
sellerRouter.get("/orders/:id", sellerController.getSellerOrderById);
sellerRouter.patch("/orders/:id/status", sellerController.updateOrderStatus);

// Dashboard
sellerRouter.get("/dashboard", sellerController.getDashboard);

export default sellerRouter;
