import { NextFunction, Request, Response } from "express";
import { userRole } from "../constant/role";
import { auth as betterAuth } from "../lib/auth";

const auth = (...roles: userRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any
      });

      console.log(session);

      if (!session) {
        return res.status(401).json({
        success: false,
        message: "You are not authorized!"
        })
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
      }

      if (roles.length && !roles.includes(req.user.role as userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resources!"
        })
      }

      // if no issue then call the next function
      next();
    } catch (error) {
        throw new Error(error as any);
    }
  }
}