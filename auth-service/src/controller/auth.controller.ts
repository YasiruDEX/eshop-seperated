import { AuthenticationError, ValidationError } from "@packages/error-handler";
import prisma from "../utils/prisma";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { setCookie } from "../utils/cookies/setCookie";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-09-30.clover",
});

//register new users
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-email");

    res.status(200).send({ message: "OTP sent to your email" });
  } catch (error) {
    return next(error);
  }
};

//verify new users
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are required!"));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOtp(email, otp);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new ValidationError("Invalid email or password!"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      return next(new AuthenticationError("Invalid email or password!"));
    }

    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    //store the refresh token
    setCookie(res, "refreshToken", refreshToken);
    setCookie(res, "accessToken", accessToken);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies["refreshToken"] ||
      req.headers["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new AuthenticationError("No refresh token provided"));
    }

    const decoded: any = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }
    if (!account) {
      return next(new AuthenticationError("Account not found"));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    if (decoded.role === "user") {
      setCookie(res, "accessToken", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }
    res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

export const verifyForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new ValidationError("No account found with this email"));
    }

    if (!user.password) {
      return next(new ValidationError("User password not found"));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password must be different from the old password"
        )
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    return next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError("");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    await sendOtp(name, email, "seller-activation");

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("All fields are required!"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!")
      );
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: { name, email, password: hashedPassword, phone_number, country },
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully!",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      return next(new ValidationError("All fields are required!"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

export const createStripeConnectionLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: "express",
      email: seller.email,
      country: seller.country || "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3001/seller/stripe-refresh",
      return_url: "http://localhost:3001/seller/stripe-success",
      type: "account_onboarding",
    });

    res.status(200).json({
      success: true,
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    return next(error);
  }
};

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller) {
      return next(new ValidationError("Invalid email or password!"));
    }

    const isMatch = await bcrypt.compare(password, seller.password!);

    if (!isMatch) {
      return next(new AuthenticationError("Invalid email or password!"));
    }

    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    //store the refresh token
    setCookie(res, "seller-refreshToken", refreshToken);
    setCookie(res, "seller-accessToken", accessToken);

    res.status(200).json({
      message: "Login successful",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.params.sellerId || req.seller?.id;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: {
        shop: {
          include: {
            avatar: true,
          },
        },
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    res.status(200).json({
      success: true,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone_number: seller.phone_number,
        country: seller.country,
      },
      shop: seller.shop,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSellerShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.params.sellerId || req.seller?.id;
    const {
      shopName,
      bio,
      address,
      opening_hours,
      website,
      category,
      coverBanner,
      socialLinks,
    } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    let shop;

    if (seller.shop) {
      // Update existing shop
      const updateData: any = {};

      if (shopName !== undefined) updateData.name = shopName;
      if (bio !== undefined) updateData.bio = bio;
      if (address !== undefined) updateData.address = address;
      if (opening_hours !== undefined) updateData.opening_hours = opening_hours;
      if (website !== undefined) updateData.website = website;
      if (category !== undefined) updateData.category = category;
      if (coverBanner !== undefined) updateData.coverBanner = coverBanner;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

      shop = await prisma.shops.update({
        where: { id: seller.shop.id },
        data: updateData,
        include: {
          avatar: true,
        },
      });
    } else {
      // Create new shop if doesn't exist
      if (!shopName || !address) {
        return next(
          new ValidationError(
            "Shop name and address are required to create a shop"
          )
        );
      }

      shop = await prisma.shops.create({
        data: {
          name: shopName,
          bio: bio || "",
          address,
          opening_hours: opening_hours || "",
          website: website || "",
          category: category || "",
          coverBanner: coverBanner || "",
          socialLinks: socialLinks || [],
          sellerId,
        },
        include: {
          avatar: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSellerProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.params.sellerId || req.seller?.id;
    const { name, phone_number, country } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (country !== undefined) updateData.country = country;

    const seller = await prisma.sellers.update({
      where: { id: sellerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        country: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      seller,
    });
  } catch (error) {
    return next(error);
  }
};
