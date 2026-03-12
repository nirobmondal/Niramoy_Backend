import { Request, Response } from "express";
import { categoryService } from "./categories.service";

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAllCategories(
      req.query as { page?: string; limit?: string; search?: string }
    );

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

const getCategoryWithMedicines = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryWithMedicines(
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Category with medicines fetched successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch category",
    });
  }
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

export const categoryController = {
  getAllCategories,
  getCategoryWithMedicines,
  createCategory,
  updateCategory,
  deleteCategory,
};