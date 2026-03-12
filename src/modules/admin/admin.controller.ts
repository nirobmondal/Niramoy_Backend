import { Request, Response } from "express";
import { adminService } from "./admin.service";

const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await adminService.getDashboard();

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboard,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data",
    });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getUsers(
      req.query as {
        role?: string;
        search?: string;
        page?: string;
        limit?: string;
      }
    );

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

const toggleBan = async (req: Request, res: Response) => {
  try {
    const { isBanned } = req.body;

    if (typeof isBanned !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isBanned (boolean) is required",
      });
    }

    const user = await adminService.toggleBan(
      req.user!.id,
      req.params.id as string,
      isBanned
    );

    res.status(200).json({
      success: true,
      message: isBanned
        ? "User banned successfully"
        : "User unbanned successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user ban status",
    });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getOrders(
      req.query as {
        status?: string;
        date?: string;
        seller?: string;
        page?: string;
        limit?: string;
      }
    );

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

const getMedicines = async (req: Request, res: Response) => {
  try {
    const result = await adminService.getMedicines(
      req.query as {
        search?: string;
        seller?: string;
        category?: string;
        page?: string;
        limit?: string;
      }
    );

    res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch medicines",
    });
  }
};

export const adminController = {
  getDashboard,
  getUsers,
  toggleBan,
  getOrders,
  getMedicines,
};