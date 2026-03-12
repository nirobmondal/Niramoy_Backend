import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../helpers/AppError";

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Default values
  let statusCode = 500;
  let message = "Internal server error";
  let errorDetails: Record<string, unknown> | undefined;

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Prisma known request errors (unique constraint, not found, etc.)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        statusCode = 409;
        const target = (err.meta?.target as string[]) ?? [];
        message = `Duplicate value for: ${target.join(", ")}`;
        break;
      }
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference — related record does not exist";
        break;
      default:
        statusCode = 400;
        message = err.message;
    }
    errorDetails = { code: err.code, meta: err.meta };
  }

  // Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  }

  // JSON parse errors (malformed body)
  else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // Legacy errors with statusCode property (from Object.assign pattern)
  else if ("statusCode" in err && typeof (err as any).statusCode === "number") {
    statusCode = (err as any).statusCode;
    message = err.message;
  }

  // Log unexpected errors in development
  if (statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errorDetails ? { errorDetails } : {}),
  });
}
