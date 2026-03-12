import { Request, Response } from "express";
import { orderService } from "./orders.service";

const checkout = async (req: Request, res: Response) => {
  try {
    const { shippingAddress, shippingCity, phone, notes } = req.body;

    if (!shippingAddress || !shippingCity || !phone) {
      return res.status(400).json({
        success: false,
        message: "shippingAddress, shippingCity, and phone are required",
      });
    }

    const order = await orderService.checkout(req.user!.id, {
      shippingAddress,
      shippingCity,
      phone,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};

const getUserOrders = async (req: Request, res: Response) => {
  try {
    const result = await orderService.getUserOrders(
      req.user!.id,
      req.query as { page?: string; limit?: string; status?: string }
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

const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await orderService.getOrderById(
      req.user!.id,
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.cancelOrder(
      req.user!.id,
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  }
};

export const orderController = {
  checkout,
  getUserOrders,
  getOrderById,
  cancelOrder,
};