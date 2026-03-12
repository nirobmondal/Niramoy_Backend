import { Request, Response } from "express";
import { medicineService } from "./medicines.service";

const getAllMedicines = async (req: Request, res: Response) => {
  try {
    const result = await medicineService.getAllMedicines(
      req.query as {
        search?: string;
        category?: string;
        manufacturer?: string;
        minPrice?: string;
        maxPrice?: string;
        sortBy?: string;
        sortOrder?: string;
        page?: string;
        limit?: string;
      }
    );

    res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch medicines",
    });
  }
};

const getMedicineById = async (req: Request, res: Response) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id as string);

    res.status(200).json({
      success: true,
      message: "Medicine fetched successfully",
      data: medicine,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch medicine",
    });
  }
};

export const medicineController = {
  getAllMedicines,
  getMedicineById,
};