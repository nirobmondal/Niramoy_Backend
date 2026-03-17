import { Request, Response } from "express";
import { manufacturerService } from "./manufacturers.service";

const getAllManufacturers = async (_req: Request, res: Response) => {
  const manufacturers = await manufacturerService.getAllManufacturers();

  res.status(200).json({
    success: true,
    data: manufacturers,
  });
};

const createManufacturer = async (req: Request, res: Response) => {
  const manufacturer = await manufacturerService.createManufacturer(req.body);

  res.status(201).json({
    success: true,
    data: manufacturer,
  });
};

export const manufacturerController = {
  getAllManufacturers,
  createManufacturer,
};
