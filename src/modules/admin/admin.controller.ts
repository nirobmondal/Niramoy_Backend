import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { AppError } from "../../helpers/AppError";

const getDashboard = async (req: Request, res: Response) => {
  const dashboard = await adminService.getDashboard();

  res.status(200).json({
    success: true,
    message: "Dashboard data fetched successfully",
    data: dashboard,
  });
};

const getUsers = async (req: Request, res: Response) => {
  const result = await adminService.getUsers(
    req.query as {
      role?: string;
      search?: string;
      page?: string;
      limit?: string;
    },
  );

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

const toggleBan = async (req: Request, res: Response) => {
  const { isBanned } = req.body;

  if (typeof isBanned !== "boolean") {
    throw new AppError("isBanned (boolean) is required", 400);
  }

  const user = await adminService.toggleBan(
    req.user!.id,
    req.params.id as string,
    isBanned,
  );

  res.status(200).json({
    success: true,
    message: isBanned
      ? "User banned successfully"
      : "User unbanned successfully",
    data: user,
  });
};

const getOrders = async (req: Request, res: Response) => {
  const result = await adminService.getOrders(
    req.query as {
      status?: string;
      date?: string;
      seller?: string;
      customer?: string;
      page?: string;
      limit?: string;
    },
  );

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getMedicines = async (req: Request, res: Response) => {
  const result = await adminService.getMedicines(
    req.query as {
      search?: string;
      seller?: string;
      category?: string;
      page?: string;
      limit?: string;
    },
  );

  res.status(200).json({
    success: true,
    message: "Medicines fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

export const adminController = {
  getDashboard,
  getUsers,
  toggleBan,
  getOrders,
  getMedicines,
};
