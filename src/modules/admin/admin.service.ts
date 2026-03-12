import { Prisma, OrderStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../helpers/paginationSortingHelper";

// ── Dashboard Metrics ─────────────────────────────────────────
const getDashboard = async () => {
  const [totalUsers, totalOrders, revenueAgg, totalMedicines, totalSellers] =
    await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
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
const getUsers = async (query: {
  role?: string;
  search?: string;
  page?: string;
  limit?: string;
}) => {
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  // Admin cannot ban another admin
  if (user.role === "AMDIN") {
    throw Object.assign(new Error("Cannot ban an admin user"), {
      statusCode: 403,
    });
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
const getOrders = async (query: {
  status?: string;
  date?: string;
  seller?: string;
  page?: string;
  limit?: string;
}) => {
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
const getMedicines = async (query: {
  search?: string;
  seller?: string;
  category?: string;
  page?: string;
  limit?: string;
}) => {
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