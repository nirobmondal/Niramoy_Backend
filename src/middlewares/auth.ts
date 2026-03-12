import { NextFunction, Request, Response } from "express";
import { userRole } from "../constant/role";
import { auth as betterAuth } from "../lib/auth";

const auth = (...roles: userRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await betterAuth.api.getSession({
      headers: req.headers as any
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: "You are not authorized!"
      });
      return;
    }

    // Check if user is banned
    if (session.user.isBanned) {
      res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support for assistance."
      });
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as string,
    };

    if (roles.length && !roles.includes(req.user.role as userRole)) {
      res.status(403).json({
        success: false,
        message: "Forbidden! You don't have permission to access this resource!"
      });
      return;
    }

    next();
  };
};

export default auth;