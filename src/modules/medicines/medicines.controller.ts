import { Request, Response } from "express";
import { medicineService } from "./medicines.service";
import { MedicineQuery } from "./medicines.interface";

const getAllMedicines = async (req: Request, res: Response) => {
  const result = await medicineService.getAllMedicines(
    req.query as MedicineQuery
  );

  res.status(200).json({
    success: true,
    message: "Medicines fetched successfully",
    data: result.data,
    meta: result.meta,
  });
};

const getMedicineById = async (req: Request, res: Response) => {
  const medicine = await medicineService.getMedicineById(req.params.id as string);

  res.status(200).json({
    success: true,
    message: "Medicine fetched successfully",
    data: medicine,
  });
};

export const medicineController = {
  getAllMedicines,
  getMedicineById,
};