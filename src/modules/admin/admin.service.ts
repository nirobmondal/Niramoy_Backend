import { Prisma, OrderStatus, PaymentStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination } from "../../helpers/paginationSortingHelper";
import { userRole } from "../../constant/role";
import { AdminUserQuery, AdminOrderQuery, AdminMedicineQuery } from "./admin.interface";

// ── Dashboard Metrics ─────────────────────────────────────────
const getDashboard = async () => {
  const [totalUsers, totalOrders, revenueAgg, totalMedicines, totalSellers] =
    await Promise.all([
      prisma.user.count(),
      // Exclude orders where ALL seller-orders are CANCELLED
      prisma.order.count({
        where: {
          sellerOrders: {
            some: { status: { not: OrderStatus.CANCELLED } },
          },
        },
      }),
      // Revenue only from orders with paymentStatus PAID
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { totalPrice: true },
      }),
      prisma.medicine.count(),
      prisma.sellerProfile.count(),
    ]);

  return {
    totalUsers,
    totalOrders,
    totalRevenue: Number(revenueAgg._sum.totalPrice || 0),
    totalMedicines,
    totalSellers,
  };
};

// ── Get Users (paginated + filtered) ──────────────────────────
const getUsers = async (query: AdminUserQuery) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        phone: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Ban / Unban User ──────────────────────────────────────────
const toggleBan = async (adminId: string, userId: string, isBanned: boolean) => {
  if (adminId === userId) {
    throw new AppError("You cannot ban yourself", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Admin cannot ban another admin
  if (user.role === userRole.ADMIN) {
    throw new AppError("Cannot ban an admin user", 403);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isBanned },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });

  return updated;
};

// ── Get Orders (paginated + filtered) ─────────────────────────
const getOrders = async (query: AdminOrderQuery) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.OrderWhereInput = {};

  if (query.status) {
    where.sellerOrders = {
      some: { status: query.status as OrderStatus },
    };
  }

  if (query.date) {
    const start = new Date(query.date);
    const end = new Date(query.date);
    end.setDate(end.getDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }

  if (query.seller) {
    where.sellerOrders = {
      ...((where.sellerOrders as Prisma.SellerOrderListRelationFilter) || {}),
      some: {
        ...((where.sellerOrders as Prisma.SellerOrderListRelationFilter)
          ?.some as Prisma.SellerOrderWhereInput || {}),
        sellerId: query.seller,
      },
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
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

// ── Get Medicines (paginated + filtered) ──────────────────────
const getMedicines = async (query: AdminMedicineQuery) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.MedicineWhereInput = {};

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  if (query.seller) {
    where.sellerId = query.seller;
  }

  if (query.category) {
    where.categoryId = query.category;
  }

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, storeName: true } },
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

export const adminService = {
  getDashboard,
  getUsers,
  toggleBan,
  getOrders,
  getMedicines,
};