import { prisma } from "../../lib/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination } from "../../helpers/paginationSortingHelper";
import { calculateAverageRating } from "../../helpers/ratingHelper";
import { Prisma } from "../../../generated/prisma/client";
import { MedicineQuery } from "./medicines.interface";

// ── Get All Medicines (paginated + filtered + sorted) ─────────
const getAllMedicines = async (query: MedicineQuery) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.MedicineWhereInput = {
    isAvailable: true,
    ...(query.search && {
      name: { contains: query.search, mode: "insensitive" },
    }),
    ...(query.categoryId && {
      categoryId: query.categoryId,
    }),
    ...(query.manufacturerId && {
      manufacturerId: query.manufacturerId,
    }),
  };

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) {
      where.price.gte = new Prisma.Decimal(query.minPrice);
    }
    if (query.maxPrice) {
      where.price.lte = new Prisma.Decimal(query.maxPrice);
    }
  }

  // Sorting
  const orderBy: Prisma.MedicineOrderByWithRelationInput = {};
  if (query.sortBy === "price") {
    orderBy.price = query.sortOrder === "desc" ? "desc" : "asc";
  } else if (query.sortBy === "rating") {
    orderBy.reviews = { _count: query.sortOrder === "desc" ? "desc" : "asc" };
  } else {
    orderBy.createdAt = "desc";
  }

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, name: true } },
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

// ── Get Medicine By ID ────────────────────────────────────────
const getMedicineById = async (medicineId: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
    include: {
      category: true,
      manufacturer: {
        select: {
          id: true,
          name: true,
        },
      },
      seller: {
        select: {
          id: true,
          storeName: true,
          storeLogo: true,
          address: true,
          contactNumber: true,
        },
      },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  const averageRating = calculateAverageRating(
    medicine.reviews.map((r) => r.rating),
  );

  return {
    ...medicine,
    averageRating,
  };
};

export const medicineService = {
  getAllMedicines,
  getMedicineById,
};
