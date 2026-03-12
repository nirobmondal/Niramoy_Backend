import { Request, Response } from "express";
import { cartService } from "./cart.service";

const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await cartService.getCart(req.user!.id);

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch cart",
    });
  }
};

const addItem = async (req: Request, res: Response) => {
  try {
    const { medicineId, quantity } = req.body;

    if (!medicineId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "medicineId and a valid quantity (>= 1) are required",
      });
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add item to cart",
    });
  }
};

const updateItem = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "A valid quantity (>= 1) is required",
      });
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

const removeItem = async (req: Request, res: Response) => {
  try {
    await cartService.removeItem(req.user!.id, req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to remove item from cart",
    });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    await cartService.clearCart(req.user!.id);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};

export const cartController = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};