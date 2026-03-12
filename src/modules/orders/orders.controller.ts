import { Request, Response } from "express";
import { orderService } from "./orders.service";
import { AppError } from "../../helpers/AppError";

const checkout = async (req: Request, res: Response) => {
  const { shippingAddress, shippingCity, phone, notes } = req.body;

  if (!shippingAddress || !shippingCity || !phone) {
    throw new AppError("shippingAddress, shippingCity, and phone are required", 400);
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
};

const getUserOrders = async (req: Request, res: Response) => {
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
};

const getOrderById = async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(
    req.user!.id,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: order,
  });
};

const cancelOrder = async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(
    req.user!.id,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
};

export const orderController = {
  checkout,
  getUserOrders,
  getOrderById,
  cancelOrder,
};