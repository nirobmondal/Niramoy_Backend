import { toNodeHandler } from "better-auth/node";
import express, { Request, Response } from "express";
import cors from "cors";

import { config } from "./config";
import { auth } from "./lib/auth";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import sellerRouter from "./modules/sellers/sellers.routes";
import categoryRouter from "./modules/categories/categories.routes";
import medicineRouter from "./modules/medicines/medicines.routes";
import cartRouter from "./modules/cart/cart.routes";
import orderRouter from "./modules/orders/orders.routes";
import reviewRouter from "./modules/reviews/reviews.routes";
import adminRouter from "./modules/admin/admin.routes";
import userRouter from "./modules/users/users.routes";
import manufacturerRouter from "./modules/manufacturers/manufacturers.routes";
const app = express();

// global middlewares
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);
app.use(express.json());

// better auth api's
app.all("/api/auth/*splat", toNodeHandler(auth));

// testing route
app.get("/", (req: Request, res: Response) => {
  res.send("Niramoy backend is running.");
});

// seller routes
app.use("/api/seller", sellerRouter);

// category routes
app.use("/api/categories", categoryRouter);

// manufacturer routes
app.use("/api/manufacturers", manufacturerRouter);

// medicine routes
app.use("/api/medicines", medicineRouter);

// cart routes
app.use("/api/cart", cartRouter);

// order routes
app.use("/api/orders", orderRouter);

// review routes (PATCH/DELETE /api/reviews/:id)
app.use("/api/reviews", reviewRouter);

// admin routes
app.use("/api/admin", adminRouter);

// user routes
app.use("/api/users", userRouter);

// not found api
app.use(notFound);

// global error handler
app.use(globalErrorHandler);

export default app;
