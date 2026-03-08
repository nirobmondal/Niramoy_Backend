import { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.send(404).json({
      message: "Route not found!",
      path: req.originalUrl,
      date: Date()
  })
}