import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

// ── Helper: get or create cart for user ───────────────────────
const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  return cart;
};

// ── Get Cart ──────────────────────────────────────────────────
const getCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true,
              isAvailable: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { items: [], totalPrice: 0 };
  }

  const totalPrice = cart.items.reduce((sum, item) => {
    return sum + Number(item.medicine.price) * item.quantity;
  }, 0);

  return {
    id: cart.id,
    items: cart.items,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
};

// ── Add Item to Cart ──────────────────────────────────────────
const addItem = async (
  userId: string,
  data: { medicineId: string; quantity: number }
) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: data.medicineId },
    select: { id: true, stock: true, isAvailable: true },
  });

  if (!medicine || !medicine.isAvailable) {
    throw Object.assign(new Error("Medicine not found or unavailable"), {
      statusCode: 404,
    });
  }

  const cart = await getOrCreateCart(userId);

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_medicineId: { cartId: cart.id, medicineId: data.medicineId } },
  });

  const newQuantity = existingItem
    ? existingItem.quantity + data.quantity
    : data.quantity;

  if (newQuantity > medicine.stock) {
    throw Object.assign(
      new Error(
        `Requested quantity (${newQuantity}) exceeds available stock (${medicine.stock})`
      ),
      { statusCode: 400 }
    );
  }

  if (existingItem) {
    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: { medicine: { select: { id: true, name: true, price: true } } },
    });
    return updated;
  }

  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      medicineId: data.medicineId,
      quantity: data.quantity,
    },
    include: { medicine: { select: { id: true, name: true, price: true } } },
  });

  return cartItem;
};

// ── Update Item Quantity ──────────────────────────────────────
const updateItem = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { medicine: { select: { stock: true } } },
  });

  if (!cartItem || cartItem.cartId !== cart.id) {
    throw Object.assign(new Error("Cart item not found"), { statusCode: 404 });
  }

  if (quantity > cartItem.medicine.stock) {
    throw Object.assign(
      new Error(
        `Requested quantity (${quantity}) exceeds available stock (${cartItem.medicine.stock})`
      ),
      { statusCode: 400 }
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { medicine: { select: { id: true, name: true, price: true } } },
  });

  return updated;
};

// ── Remove Item from Cart ─────────────────────────────────────
const removeItem = async (userId: string, cartItemId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem || cartItem.cartId !== cart.id) {
    throw Object.assign(new Error("Cart item not found"), { statusCode: 404 });
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
};

// ── Clear Cart ────────────────────────────────────────────────
const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

export const cartService = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};