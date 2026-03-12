import { Request, Response } from "express";
import { sellerService } from "./sellers.service";
import { AppError } from "../../helpers/AppError";

const createSellerProfile = async (req: Request, res: Response) => {
  const profile = await sellerService.createSellerProfile(
    req.user!.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Seller profile created successfully",
    data: profile,
  });
};

const addMedicine = async (req: Request, res: Response) => {
  const medicine = await sellerService.addMedicine(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    message: "Medicine added successfully",
    data: medicine,
  });
};

const editMedicine = async (req: Request, res: Response) => {
  const medicine = await sellerService.editMedicine(
    req.user!.id,
    req.params.id as string,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Medicine updated successfully",
    data: medicine,
  });
};

const removeMedicine = async (req: Request, res: Response) => {
  const medicine = await sellerService.removeMedicine(
    req.user!.id,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: "Medicine removed successfully",
    data: medicine,
  });
};

const updateStock = async (req: Request, res: Response) => {
  const { stock } = req.body;

  if (stock == null || typeof stock !== "number" || stock < 0) {
    throw new AppError("A valid stock value (>= 0) is required", 400);
  }

  const medicine = await sellerService.updateStock(
    req.user!.id,
    req.params.id as string,
    stock
  );

  res.status(200).json({
    success: true,
    message: "Stock updated successfully",
    data: medicine,
  });
};

const getSellerProfile = async (req: Request, res: Response) => {
  const profile = await sellerService.getSellerProfile(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Seller profile fetched successfully",
    data: profile,
  });
};

const updateSellerProfile = async (req: Request, res: Response) => {
  const profile = await sellerService.updateSellerProfile(
    req.user!.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Seller profile updated successfully",
    data: profile,
  });
};

const getSellerMedicines = async (req: Request, res: Response) => {
  const result = await sellerService.getSellerMedicines(
    req.user!.id,
    req.query as { page?: string; limit?: string; search?: string }
  );

  res.status(200).json({
    success: true,
    message: "Medicines fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getOrders = async (req: Request, res: Response) => {
  const result = await sellerService.getSellerOrders(
    req.user!.id,
    req.query as { page?: string; limit?: string; status?: string }
  );

  res.status(200).json({
    success: true,
    message: "Orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
};

const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  const order = await sellerService.updateOrderStatus(
    req.user!.id,
    req.params.id as string,
    status
  );

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
};

const getSellerOrderById = async (req: Request, res: Response) => {
  const order = await sellerService.getSellerOrderById(
    req.user!.id,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: "Order details fetched successfully",
    data: order,
  });
};

const getDashboard = async (req: Request, res: Response) => {
  const dashboard = await sellerService.getDashboard(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Dashboard data fetched successfully",
    data: dashboard,
  });
};

export const sellerController = {
  createSellerProfile,
  getSellerProfile,
  updateSellerProfile,
  addMedicine,
  editMedicine,
  removeMedicine,
  updateStock,
  getSellerMedicines,
  getOrders,
  updateOrderStatus,
  getSellerOrderById,
  getDashboard,
};