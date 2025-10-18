import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies["accessToken"] ||
      req.cookies["seller-accessToken"] ||
      req.headers["seller-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: "user" | "seller" | "admin" };

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account; // Attach seller to request
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.role = decoded.role;

    return next();
  } catch (error: any) {
    return res.status(401).json({
      message: "Unauthorized",
      error: error.message || error,
    });
  }
};

export default isAuthenticated;
