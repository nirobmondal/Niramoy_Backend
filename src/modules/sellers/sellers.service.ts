import {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "../../../generated/prisma/client";
import { userRole } from "../../constant/role";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination } from "../../helpers/paginationSortingHelper";
import {
  CreateSellerProfileInput,
  UpdateSellerProfileInput,
  CreateMedicineInput,
  UpdateMedicineInput,
  SellerOrderQuery,
  SellerMedicineQuery,
} from "./sellers.interface";

// Valid status transitions
const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  PLACED: OrderStatus.PROCESSING,
  PROCESSING: OrderStatus.SHIPPED,
  SHIPPED: OrderStatus.DELIVERED,
  DELIVERED: null,
  CANCELLED: null,
};

// Statuses that can be cancelled
const CANCELLABLE: OrderStatus[] = [OrderStatus.PLACED, OrderStatus.PROCESSING];

// ── Create Seller Profile ─────────────────────────────────────
const createSellerProfile = async (
  userId: string,
  data: CreateSellerProfileInput,
) => {
  if (!data.storeName || !data.address || !data.contactNumber) {
    throw new AppError(
      "storeName, address, and contactNumber are required",
      400,
    );
  }

  const existing = await prisma.sellerProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new AppError("Seller profile already exists", 409);
  }

  const [sellerProfile] = await prisma.$transaction([
    prisma.sellerProfile.create({
      data: {
        ...data,
        userId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { role: userRole.SELLER },
    }),
  ]);

  return sellerProfile;
};

async function getSellerProfileId(userId: string): Promise<string> {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError("Seller profile not found", 404);
  }

  return profile.id;
}

// ── Add Medicine ──────────────────────────────────────────────
const addMedicine = async (userId: string, data: CreateMedicineInput) => {
  if (
    !data.name ||
    !data.price ||
    !data.dosageForm ||
    !data.categoryId ||
    !data.manufacturerId
  ) {
    throw new AppError(
      "name, price, dosageForm, categoryId, and manufacturerId are required",
      400,
    );
  }

  const sellerId = await getSellerProfileId(userId);

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: data.manufacturerId },
    select: { id: true },
  });

  if (!manufacturer) {
    throw new AppError("Manufacturer not found", 404);
  }

  const medicine = await prisma.medicine.create({
    data: {
      ...data,
      sellerId,
    },
  });

  return medicine;
};

// ── Edit Medicine ─────────────────────────────────────────────
const editMedicine = async (
  userId: string,
  medicineId: string,
  data: UpdateMedicineInput,
) => {
  const sellerId = await getSellerProfileId(userId);

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { sellerId: true },
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  if (medicine.sellerId !== sellerId) {
    throw new AppError("You are not authorized to edit this medicine", 403);
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if (data.manufacturerId) {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: data.manufacturerId },
      select: { id: true },
    });

    if (!manufacturer) {
      throw new AppError("Manufacturer not found", 404);
    }
  }

  const updated = await prisma.medicine.update({
    where: { id: medicineId },
    data,
  });

  return updated;
};

// ── Soft-Delete Medicine ──────────────────────────────────────
const removeMedicine = async (userId: string, medicineId: string) => {
  const sellerId = await getSellerProfileId(userId);

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { sellerId: true },
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  if (medicine.sellerId !== sellerId) {
    throw new AppError("You are not authorized to delete this medicine", 403);
  }

  const deleted = await prisma.medicine.update({
    where: { id: medicineId },
    data: { isAvailable: false },
  });

  return deleted;
};

// ── Update Stock ──────────────────────────────────────────────
const updateStock = async (
  userId: string,
  medicineId: string,
  stock: number,
) => {
  const sellerId = await getSellerProfileId(userId);

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { sellerId: true },
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  if (medicine.sellerId !== sellerId) {
    throw new AppError(
      "You are not authorized to update stock for this medicine",
      403,
    );
  }

  const updated = await prisma.medicine.update({
    where: { id: medicineId },
    data: { stock },
  });

  return updated;
};

// ── Get Seller Orders (paginated + status filter) ─────────────
const getSellerOrders = async (
  userId: string,
  query: SellerOrderQuery = {},
) => {
  const sellerId = await getSellerProfileId(userId);

  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.SellerOrderWhereInput = { sellerId };

  if (query.status) {
    where.status = query.status as OrderStatus;
  }

  const [sellerOrders, total] = await Promise.all([
    prisma.sellerOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            medicine: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
        order: {
          select: {
            id: true,
            shippingAddress: true,
            phone: true,
            notes: true,
            paymentMethod: true,
            paymentStatus: true,
            customer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sellerOrder.count({ where }),
  ]);

  return {
    data: sellerOrders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Update Order Status ───────────────────────────────────────
const updateOrderStatus = async (
  userId: string,
  sellerOrderId: string,
  newStatus: OrderStatus,
) => {
  const sellerId = await getSellerProfileId(userId);

  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
    select: {
      sellerId: true,
      status: true,
      orderId: true,
      items: { select: { medicineId: true, quantity: true } },
    },
  });

  if (!sellerOrder) {
    throw new AppError("Order not found", 404);
  }

  if (sellerOrder.sellerId !== sellerId) {
    throw new AppError("You are not authorized to update this order", 403);
  }

  const currentStatus = sellerOrder.status;

  // Handle cancellation separately
  if (newStatus === OrderStatus.CANCELLED) {
    if (!CANCELLABLE.includes(currentStatus)) {
      throw new AppError(
        `Cannot cancel order with status "${currentStatus}". Only PLACED or PROCESSING orders can be cancelled.`,
        400,
      );
    }

    // Cancel and restore stock in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.sellerOrder.update({
        where: { id: sellerOrderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // Restore stock
      for (const item of sellerOrder.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return cancelled;
    });

    return updated;
  }

  // Forward-only status flow
  const expectedNext = STATUS_FLOW[currentStatus];
  if (!expectedNext || expectedNext !== newStatus) {
    throw new AppError(
      `Invalid status transition from "${currentStatus}" to "${newStatus}"`,
      400,
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.sellerOrder.update({
      where: { id: sellerOrderId },
      data: { status: newStatus },
    });

    // When delivered, check if ALL seller orders for this order are delivered
    // If so, mark the parent order's payment status as PAID
    if (newStatus === OrderStatus.DELIVERED) {
      const siblingOrders = await tx.sellerOrder.findMany({
        where: { orderId: sellerOrder.orderId },
        select: { status: true },
      });

      const allDelivered = siblingOrders.every(
        (so) => so.status === OrderStatus.DELIVERED,
      );

      if (allDelivered) {
        await tx.order.update({
          where: { id: sellerOrder.orderId },
          data: { paymentStatus: PaymentStatus.PAID },
        });
      }
    }

    return updatedOrder;
  });

  return updated;
};

// ── Get Seller Order By ID ─────────────────────────────────────
const getSellerOrderById = async (userId: string, sellerOrderId: string) => {
  const sellerId = await getSellerProfileId(userId);

  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
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
      order: {
        select: {
          id: true,
          shippingAddress: true,
          shippingCity: true,
          phone: true,
          notes: true,
          paymentMethod: true,
          paymentStatus: true,
          totalPrice: true,
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!sellerOrder) {
    throw new AppError("Order not found", 404);
  }

  if (sellerOrder.sellerId !== sellerId) {
    throw new AppError("You are not authorized to view this order", 403);
  }

  return sellerOrder;
};

// ── Seller Dashboard ──────────────────────────────────────────
const getDashboard = async (userId: string) => {
  const sellerId = await getSellerProfileId(userId);

  const [totalMedicines, orderStats, pendingOrders] = await Promise.all([
    prisma.medicine.count({ where: { sellerId } }),

    prisma.orderItem.aggregate({
      where: {
        sellerOrder: {
          sellerId,
          status: OrderStatus.DELIVERED,
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
    }),

    prisma.sellerOrder.count({
      where: {
        sellerId,
        status: { in: [OrderStatus.PLACED, OrderStatus.PROCESSING] },
      },
    }),
  ]);

  return {
    totalMedicines,
    totalSales: orderStats._sum.quantity || 0,
    totalRevenue: Number(orderStats._sum.subtotal || 0),
    pendingOrders,
  };
};

// ── Get Seller Profile ────────────────────────────────────────
const getSellerProfile = async (userId: string) => {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
    include: {
      _count: { select: { medicines: true, sellerOrders: true } },
    },
  });

  if (!profile) {
    throw new AppError("Seller profile not found", 404);
  }

  return profile;
};

// ── Update Seller Profile ─────────────────────────────────────
const updateSellerProfile = async (
  userId: string,
  data: UpdateSellerProfileInput,
) => {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError("Seller profile not found", 404);
  }

  const updated = await prisma.sellerProfile.update({
    where: { userId },
    data,
  });

  return updated;
};

// ── Get Seller's Own Medicines (paginated + search) ───────────
const getSellerMedicines = async (
  userId: string,
  query: SellerMedicineQuery = {},
) => {
  const sellerId = await getSellerProfileId(userId);

  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.MedicineWhereInput = { sellerId };

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, name: true } },
      },
    }),
    prisma.medicine.count({ where }),
  ]);

  return {
    data: medicines,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const sellerService = {
  createSellerProfile,
  getSellerProfile,
  updateSellerProfile,
  addMedicine,
  editMedicine,
  removeMedicine,
  updateStock,
  getSellerMedicines,
  getSellerOrders,
  updateOrderStatus,
  getSellerOrderById,
  getDashboard,
};
