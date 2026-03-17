import { AppError } from "../../helpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateManufacturerInput } from "./manufacturers.interface";

const normalizeManufacturerName = (name: string) =>
  name.trim().replace(/\s+/g, " ");

const createManufacturer = async (data: CreateManufacturerInput) => {
  const normalizedName = normalizeManufacturerName(data.name || "");

  if (!normalizedName) {
    throw new AppError("Manufacturer name is required", 400);
  }

  const existing = await prisma.manufacturer.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Manufacturer with this name already exists", 409);
  }

  const manufacturer = await prisma.manufacturer.create({
    data: { name: normalizedName },
    select: { id: true, name: true },
  });

  return manufacturer;
};

const getAllManufacturers = async () => {
  const manufacturers = await prisma.manufacturer.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return manufacturers;
};

export const manufacturerService = {
  createManufacturer,
  getAllManufacturers,
};
