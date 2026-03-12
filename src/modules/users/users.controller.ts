import { Request, Response } from "express";
import { userService } from "./users.service";

const getMyProfile = async (req: Request, res: Response) => {
  const user = await userService.getMyProfile(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: user,
  });
};

const updateMyProfile = async (req: Request, res: Response) => {
  const user = await userService.updateMyProfile(req.user!.id, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
};

export const userController = {
  getMyProfile,
  updateMyProfile,
};