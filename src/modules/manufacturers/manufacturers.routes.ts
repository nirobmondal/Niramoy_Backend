import { Router } from "express";
import { manufacturerController } from "./manufacturers.controller";

const manufacturerRouter = Router();

manufacturerRouter.get("/", manufacturerController.getAllManufacturers);

export default manufacturerRouter;
