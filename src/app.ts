import { toNodeHandler } from "better-auth/node";
import express, { Request, Response } from "express";
import cors from "cors";

import { auth } from "./lib/auth";
import { notFound } from "./middlewares/notFound";
import sellerRouter from "./modules/sellers/sellers.routes";
const app = express();

// global middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());

// better auth api's
app.all("/api/auth/*splat", toNodeHandler(auth));

// testing route
app.get("/", (req: Request, res: Response) => {
  res.send("Niramoy backend is running.");
})

// seller routes
app.use("/api/seller", sellerRouter);

// not found api
app.use(notFound)

// global error handler


export default app;
