import { Router } from "express";
import auth from "../../middlewares/auth";
import { userController } from "./users.controller";

const userRouter = Router();

// All routes require authentication (any role)
userRouter.use(auth());

userRouter.get("/me", userController.getMyProfile);
userRouter.patch("/me", userController.updateMyProfile);

export default userRouter;