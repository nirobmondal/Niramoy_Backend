import { Request, Response } from "express";
import { categoryService } from "./categories.service";

const getAllCategories = async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategories(
    req.query as { page?: string; limit?: string; search?: string }
  );

  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getCategoryWithMedicines = async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryWithMedicines(
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: "Category with medicines fetched successfully",
    data: category,
  });
};

const createCategory = async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
};

const updateCategory = async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(
    req.params.id as string,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

const deleteCategory = async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
};

export const categoryController = {
  getAllCategories,
  getCategoryWithMedicines,
  createCategory,
  updateCategory,
  deleteCategory,
};