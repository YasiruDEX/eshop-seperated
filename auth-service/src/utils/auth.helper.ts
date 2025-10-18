import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import { sendEmail } from "./sendMail/index";
import redis from "@packages/libs/redis";
import { __awaiter } from "tslib";
import prisma from "@packages/libs/prisma";
import { Request, Response, NextFunction } from "express";
// import { parse } from "path";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError("Too many OTP requests. Please try again later.");
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError("Please wait before requesting another OTP.");
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError("OTP already sent. Please wait.");
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_requests_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  // Only lock if more than 2 requests (i.e., on the 4th request)
  if (otpRequests > 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // 1 hour spam lock
    throw new ValidationError(
      "Too many OTP requests. Please try again in an hour."
    );
  }

  await redis.set(otpRequestKey, (otpRequests + 1).toString(), "EX", 3600); // 1 hour window
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify your email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300); // OTP valid for 5 minutes
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // 1 minute cooldown
};

export const verifyOtp = async (email: string, otp: string) => {
  const failedAttemptsKey = `otp_failed_attempts:${email}`;
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw new ValidationError("OTP has expired. Please request a new one.");
  }

  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`);
      await redis.del(failedAttemptsKey);
      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 30 minutes!"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new ValidationError(
      `Incorrect OTP. You have ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError("No account found with this email");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    await sendOtp(
      user.name,
      email,
      userType === "user"
        ? "user-forgot-password-mail"
        : "seller-forgot-password-mail"
    );

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required");
    }
    await verifyOtp(email, otp);

    res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    return next(error);
  }
};
