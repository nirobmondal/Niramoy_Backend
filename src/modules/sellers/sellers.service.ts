import { OrderStatus } from "../../../generated/prisma/client";
import { userRole } from "../../constant/role";
import { prisma } from "../../lib/prisma";

// Valid status transitions
const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  PLACED: OrderStatus.PROCESSING,
  PROCESSING: OrderStatus.SHIPPED,
  SHIPPED: OrderStatus.DELIVERED,
  DELIVERED: null,
  CANCELLED: null,
};

// Statuses that can be cancelled
const CANCELLABLE: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.PROCESSING,
];

// ── Create Seller Profile ─────────────────────────────────────
interface CreateSellerProfileInput {
  storeName: string;
  storeLogo?: string;
  address: string;
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  offDay: string;
}

const createSellerProfile = async (
  userId: string,
  data: CreateSellerProfileInput
) => {
  const existing = await prisma.sellerProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw Object.assign(new Error("Seller profile already exists"), {
      statusCode: 409,
    });
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
    throw Object.assign(new Error("Seller profile not found"), {
      statusCode: 404,
    });
  }

  return profile.id;
}

// ── Add Medicine ──────────────────────────────────────────────
interface CreateMedicineInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  manufacturer?: string;
  imageUrl?: string;
  dosageForm: string;
  strength?: string;
  categoryId: string;
}

const addMedicine = async (userId: string, data: CreateMedicineInput) => {
  const sellerId = await getSellerProfileId(userId);

  const medicine = await prisma.medicine.create({
    data: {
      ...data,
      sellerId,
    },
  });

  return medicine;
};

// ── Edit Medicine ─────────────────────────────────────────────
interface UpdateMedicineInput {
  name?: string;
  description?: string;
  price?: number;
  manufacturer?: string;
  imageUrl?: string;
  dosageForm?: string;
  strength?: string;
  categoryId?: string;
}

const editMedicine = async (
  userId: string,
  medicineId: string,
  data: UpdateMedicineInput
) => {
  const sellerId = await getSellerProfileId(userId);

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { sellerId: true },
  });

  if (!medicine) {
    throw Object.assign(new Error("Medicine not found"), { statusCode: 404 });
  }

  if (medicine.sellerId !== sellerId) {
    throw Object.assign(
      new Error("You are not authorized to edit this medicine"),
      { statusCode: 403 }
    );
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
    throw Object.assign(new Error("Medicine not found"), { statusCode: 404 });
  }

  if (medicine.sellerId !== sellerId) {
    throw Object.assign(
      new Error("You are not authorized to delete this medicine"),
      { statusCode: 403 }
    );
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
  stock: number
) => {
  const sellerId = await getSellerProfileId(userId);

  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    select: { sellerId: true },
  });

  if (!medicine) {
    throw Object.assign(new Error("Medicine not found"), { statusCode: 404 });
  }

  if (medicine.sellerId !== sellerId) {
    throw Object.assign(
      new Error("You are not authorized to update stock for this medicine"),
      { statusCode: 403 }
    );
  }

  const updated = await prisma.medicine.update({
    where: { id: medicineId },
    data: { stock },
  });

  return updated;
};

// ── Get Seller Orders ─────────────────────────────────────────
const getSellerOrders = async (userId: string) => {
  const sellerId = await getSellerProfileId(userId);

  const sellerOrders = await prisma.sellerOrder.findMany({
    where: { sellerId },
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
  });

  return sellerOrders;
};

// ── Update Order Status ───────────────────────────────────────
const updateOrderStatus = async (
  userId: string,
  sellerOrderId: string,
  newStatus: OrderStatus
) => {
  const sellerId = await getSellerProfileId(userId);

  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
    select: { sellerId: true, status: true },
  });

  if (!sellerOrder) {
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  }

  if (sellerOrder.sellerId !== sellerId) {
    throw Object.assign(
      new Error("You are not authorized to update this order"),
      { statusCode: 403 }
    );
  }

  const currentStatus = sellerOrder.status;

  // Handle cancellation separately
  if (newStatus === OrderStatus.CANCELLED) {
    if (!CANCELLABLE.includes(currentStatus)) {
      throw Object.assign(
        new Error(
          `Cannot cancel order with status "${currentStatus}". Only PLACED or PROCESSING orders can be cancelled.`
        ),
        { statusCode: 400 }
      );
    }
  } else {
    // Forward-only status flow
    const expectedNext = STATUS_FLOW[currentStatus];
    if (!expectedNext || expectedNext !== newStatus) {
      throw Object.assign(
        new Error(
          `Invalid status transition from "${currentStatus}" to "${newStatus}"`
        ),
        { statusCode: 400 }
      );
    }
  }

  const updated = await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data: { status: newStatus },
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
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  }

  if (sellerOrder.sellerId !== sellerId) {
    throw Object.assign(
      new Error("You are not authorized to view this order"),
      { statusCode: 403 }
    );
  }

  return sellerOrder;
};

// ── Seller Dashboard ──────────────────────────────────────────
const getDashboard = async (userId: string) => {
  const sellerId = await getSellerProfileId(userId);

  const [totalMedicines, orderStats, pendingOrders] = await Promise.all([
    // Total medicines owned by seller
    prisma.medicine.count({ where: { sellerId } }),

    // Total sales (items sold) and total revenue from DELIVERED orders
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

    // Pending orders (PLACED or PROCESSING)
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

export const sellerService = {
  createSellerProfile,
  addMedicine,
  editMedicine,
  removeMedicine,
  updateStock,
  getSellerOrders,
  updateOrderStatus,
  getSellerOrderById,
  getDashboard,
};
