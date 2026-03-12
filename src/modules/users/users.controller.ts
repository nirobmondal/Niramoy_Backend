import { Request, Response } from "express";
import { userService } from "./users.service";

const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = await userService.getMyProfile(req.user!.id);

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateMyProfile(req.user!.id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

export const userController = {
  getMyProfile,
  updateMyProfile,
};