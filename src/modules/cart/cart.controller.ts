import { Request, Response } from "express";
import { cartService } from "./cart.service";
import { AppError } from "../../helpers/AppError";

const getCart = async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
};

const addItem = async (req: Request, res: Response) => {
  const { medicineId, quantity } = req.body;

  if (!medicineId || !quantity || quantity < 1) {
    throw new AppError("medicineId and a valid quantity (>= 1) are required", 400);
  }

  const cartItem = await cartService.addItem(req.user!.id, {
    medicineId,
    quantity,
  });

  res.status(201).json({
    success: true,
    message: "Item added to cart successfully",
    data: cartItem,
  });
};

const updateItem = async (req: Request, res: Response) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new AppError("A valid quantity (>= 1) is required", 400);
  }

  const cartItem = await cartService.updateItem(
    req.user!.id,
    req.params.id as string,
    quantity
  );

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: cartItem,
  });
};

const removeItem = async (req: Request, res: Response) => {
  await cartService.removeItem(req.user!.id, req.params.id as string);

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: null,
  });
};

const clearCart = async (req: Request, res: Response) => {
  await cartService.clearCart(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: null,
  });
};

export const cartController = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};