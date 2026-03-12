import { Router } from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../constant/role";
import { cartController } from "./cart.controller";

const cartRouter = Router();

// All cart routes require authenticated CUSTOMER
cartRouter.use(auth(userRole.CUSTOMER));

cartRouter.get("/", cartController.getCart);
cartRouter.post("/items", cartController.addItem);
cartRouter.patch("/items/:id", cartController.updateItem);
cartRouter.delete("/items/:id", cartController.removeItem);
cartRouter.delete("/", cartController.clearCart);

export default cartRouter;