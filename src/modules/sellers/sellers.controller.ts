import { Request, Response } from "express";
import { sellerService } from "./sellers.service";

const addMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await sellerService.addMedicine(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: medicine,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add medicine",
    });
  }
};

const editMedicine = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update medicine",
    });
  }
};

const removeMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await sellerService.removeMedicine(
      req.user!.id,
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Medicine removed successfully",
      data: medicine,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to remove medicine",
    });
  }
};

const updateStock = async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;

    if (stock == null || typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "A valid stock value (>= 0) is required",
      });
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update stock",
    });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await sellerService.getSellerOrders(req.user!.id);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

export const sellerController = {
  addMedicine,
  editMedicine,
  removeMedicine,
  updateStock,
  getOrders,
  updateOrderStatus,
};