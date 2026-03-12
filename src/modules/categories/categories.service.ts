import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../helpers/paginationSortingHelper";

// ── Get All Categories (paginated + search) ───────────────────
const getAllCategories = async (query: {
  page?: string;
  limit?: string;
  search?: string;
}) => {
  const { page, limit, skip } = calculatePagination({
    page: query.page,
    limit: query.limit,
  });

  const where = query.search
    ? { name: { contains: query.search, mode: "insensitive" as const } }
    : {};

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    data: categories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get Category With Medicines ───────────────────────────────
const getCategoryWithMedicines = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { medicines: true },
  });

  if (!category) {
    throw Object.assign(new Error("Category not found"), {
      statusCode: 404,
    });
  }

  return category;
};

// ── Create Category ───────────────────────────────────────────
const createCategory = async (data: {
  name: string;
  description?: string;
}) => {
  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw Object.assign(new Error("Category with this name already exists"), {
      statusCode: 409,
    });
  }

  const category = await prisma.category.create({ data });
  return category;
};

// ── Update Category ───────────────────────────────────────────
const updateCategory = async (
  categoryId: string,
  data: { name?: string; description?: string }
) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw Object.assign(new Error("Category not found"), {
      statusCode: 404,
    });
  }

  if (data.name && data.name !== category.name) {
    const duplicate = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (duplicate) {
      throw Object.assign(
        new Error("Category with this name already exists"),
        { statusCode: 409 }
      );
    }
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data,
  });

  return updated;
};

// ── Delete Category ───────────────────────────────────────────
const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { medicines: true } } },
  });

  if (!category) {
    throw Object.assign(new Error("Category not found"), {
      statusCode: 404,
    });
  }

  if (category._count.medicines > 0) {
    throw Object.assign(
      new Error("Cannot delete category that has medicines assigned to it"),
      { statusCode: 400 }
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
};

export const categoryService = {
  getAllCategories,
  getCategoryWithMedicines,
  createCategory,
  updateCategory,
  deleteCategory,
};