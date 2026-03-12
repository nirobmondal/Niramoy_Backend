import { prisma } from "../../lib/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination } from "../../helpers/paginationSortingHelper";
import { CategoryQuery, CreateCategoryInput, UpdateCategoryInput } from "./categories.interface";

// ── Get All Categories (paginated + search) ───────────────────
const getAllCategories = async (query: CategoryQuery) => {
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
    include: {
      medicines: {
        where: { isAvailable: true },
        include: {
          seller: { select: { id: true, storeName: true } },
        },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

// ── Create Category ───────────────────────────────────────────
const createCategory = async (data: CreateCategoryInput) => {
  if (!data.name) {
    throw new AppError("Category name is required", 400);
  }

  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new AppError("Category with this name already exists", 409);
  }

  const category = await prisma.category.create({ data });
  return category;
};

// ── Update Category ───────────────────────────────────────────
const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryInput
) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (data.name && data.name !== category.name) {
    const duplicate = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (duplicate) {
      throw new AppError("Category with this name already exists", 409);
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
    throw new AppError("Category not found", 404);
  }

  if (category._count.medicines > 0) {
    throw new AppError("Cannot delete category that has medicines assigned to it", 400);
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