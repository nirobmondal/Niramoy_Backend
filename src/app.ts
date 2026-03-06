import { toNodeHandler } from "better-auth/node";
import express, { Request, Response } from "express";
import cors from "cors";

import { auth } from "./lib/auth";
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Niramoy backend is running.");
})

app.all("/api/auth/*splat", toNodeHandler(auth));

export default app;
