import { Response } from "express";

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' only works with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // ensure cookie is valid for all routes
  });
};
