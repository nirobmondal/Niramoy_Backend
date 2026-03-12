import { Prisma, OrderStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination } from "../../helpers/paginationSortingHelper";
import { calculateOrderTotal } from "../../helpers/orderCalculationHelper";
import { CheckoutInput, OrderQuery } from "./orders.interface";

// ── Checkout (Create Order from Cart) ─────────────────────────
const checkout = async (userId: string, data: CheckoutInput) => {
  // 1. Read user cart with items
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
              stock: true,
              sellerId: true,
              isAvailable: true,
            },
          },
        },
      },
    },
  });

  // 2. Validate cart not empty
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // 3. Validate medicine stock and availability
  for (const item of cart.items) {
    if (!item.medicine.isAvailable) {
      throw new AppError(
        `"${item.medicine.name}" is no longer available`,
        400
      );
    }
    if (item.quantity > item.medicine.stock) {
      throw new AppError(
        `Insufficient stock for "${item.medicine.name}". Available: ${item.medicine.stock}, Requested: ${item.quantity}`,
        400
      );
    }
  }

  // 4. Calculate total price
  const totalPrice = calculateOrderTotal(
    cart.items.map((item) => ({
      price: Number(item.medicine.price),
      quantity: item.quantity,
    }))
  );

  // 5. Group items by seller
  const itemsBySeller = new Map<
    string,
    { medicineId: string; quantity: number; price: number }[]
  >();

  for (const item of cart.items) {
    const sellerId = item.medicine.sellerId;
    if (!itemsBySeller.has(sellerId)) {
      itemsBySeller.set(sellerId, []);
    }
    itemsBySeller.get(sellerId)!.push({
      medicineId: item.medicine.id,
      quantity: item.quantity,
      price: Number(item.medicine.price),
    });
  }

  // 6–8. Create order, order items, reduce stock, clear cart — all in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // 6. Create Order
    const newOrder = await tx.order.create({
      data: {
        customerId: userId,
        totalPrice: new Prisma.Decimal(totalPrice.toFixed(2)),
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        phone: data.phone,
        notes: data.notes ?? null,
      },
    });

    // 6b. Create SellerOrders + OrderItems per seller
    for (const [sellerId, items] of itemsBySeller) {
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

      await tx.sellerOrder.create({
        data: {
          orderId: newOrder.id,
          sellerId,
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          items: {
            create: items.map((i) => ({
              medicineId: i.medicineId,
              quantity: i.quantity,
              price: new Prisma.Decimal(i.price.toFixed(2)),
              subtotal: new Prisma.Decimal((i.price * i.quantity).toFixed(2)),
            })),
          },
        },
      });
    }

    // 7. Reduce medicine stock
    for (const item of cart.items) {
      await tx.medicine.update({
        where: { id: item.medicine.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 8. Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  // Return created order with details
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      sellerOrders: {
        include: {
          items: {
            include: {
              medicine: { select: { id: true, name: true, imageUrl: true } },
            },
          },
          seller: { select: { id: true, storeName: true } },
        },
      },
    },
  });

  return fullOrder;
};

// ── Get User Orders (paginated + status filter) ───────────────
const getUserOrders = async (userId: string, query: OrderQuery) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.OrderWhereInput = { customerId: userId };

  // Filter by SellerOrder status if provided
  if (query.status) {
    where.sellerOrders = {
      some: { status: query.status as OrderStatus },
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sellerOrders: {
          select: {
            id: true,
            status: true,
            subtotal: true,
            seller: { select: { id: true, storeName: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get Order By ID ───────────────────────────────────────────
const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      sellerOrders: {
        include: {
          items: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
              storeLogo: true,
              contactNumber: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Customer can only access their own orders
  if (order.customerId !== userId) {
    throw new AppError("You are not authorized to view this order", 403);
  }

  return order;
};

// ── Cancel Order ──────────────────────────────────────────────
const cancelOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      sellerOrders: {
        select: {
          id: true,
          status: true,
          items: {
            select: { medicineId: true, quantity: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.customerId !== userId) {
    throw new AppError("You are not authorized to cancel this order", 403);
  }

  // Only cancel if ALL seller orders are still PLACED
  const allPlaced = order.sellerOrders.every(
    (so) => so.status === OrderStatus.PLACED
  );

  if (!allPlaced) {
    throw new AppError(
      "Order can only be cancelled when all sub-orders are in PLACED status",
      400
    );
  }

  // Cancel all seller orders and restore stock in a transaction
  await prisma.$transaction(async (tx) => {
    for (const so of order.sellerOrders) {
      await tx.sellerOrder.update({
        where: { id: so.id },
        data: { status: OrderStatus.CANCELLED },
      });

      // Restore stock for each item
      for (const item of so.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      sellerOrders: { select: { id: true, status: true, subtotal: true } },
    },
  });
};

export const orderService = {
  checkout,
  getUserOrders,
  getOrderById,
  cancelOrder,
};