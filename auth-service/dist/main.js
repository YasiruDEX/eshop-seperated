/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(4));
const auth_controller_1 = __webpack_require__(8);
const isAuthenticated_1 = tslib_1.__importDefault(__webpack_require__(23));
const autherizeRoles_1 = __webpack_require__(24);
const router = express_1.default.Router();
/**
 * @swagger
 * /user-registration:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account in the E-Shop authentication system.
 *     tags:
 *       - Auth
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: User registration details
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
// #swagger.tags = ['Auth']
// #swagger.summary = 'Register a new user'
// #swagger.description = 'Creates a new user account in the E-Shop authentication system'
// #swagger.parameters['body'] = {
//     in: 'body',
//     description: 'User registration details',
//     required: true,
//     schema: {
//       $email: 'user@example.com',
//       $password: 'password123'
//     }
// }
// #swagger.responses[201] = { description: 'User created successfully' }
// #swagger.responses[400] = { description: 'Invalid input' }
router.post("/user-registration", auth_controller_1.userRegistration);
router.post("/verify-user", auth_controller_1.verifyUser);
router.post("/login-user", auth_controller_1.loginUser);
router.post("/refresh-token", auth_controller_1.refreshToken);
router.get("/logged-in-user", isAuthenticated_1.default, auth_controller_1.getUser);
/**
 * @swagger
 * /forgot-password-user:
 *   post:
 *     summary: Request OTP for password reset
 *     description: Sends an OTP to the user's email for password reset.
 *     tags:
 *       - Auth
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Email for password reset
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Invalid input
 */
router.post("/forgot-password-user", auth_controller_1.userForgotPassword);
/**
 * @swagger
 * /verify-forgot-password-user:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Verifies the OTP sent to the user's email for password reset.
 *     tags:
 *       - Auth
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Email and OTP for verification
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - otp
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             otp:
 *               type: string
 *               example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid input
 */
router.post("/verify-forgot-password-user", auth_controller_1.verifyForgotPassword);
router.post("/reset-password-user", auth_controller_1.resetPassword);
router.post("/seller-registration", auth_controller_1.registerSeller);
router.post("/verify-seller", auth_controller_1.verifySeller);
router.post("/create-shop", auth_controller_1.createShop);
router.post("/create-stripe-link", auth_controller_1.createStripeConnectionLink);
router.post("/login-seller", auth_controller_1.loginSeller);
router.get("/logged-in-seller", isAuthenticated_1.default, autherizeRoles_1.isSeller, auth_controller_1.getSeller);
router.get("/seller-shop/:sellerId", auth_controller_1.getSellerShop);
router.put("/seller-shop/:sellerId", auth_controller_1.updateSellerShop);
router.put("/seller-profile/:sellerId", auth_controller_1.updateSellerProfile);
exports["default"] = router;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateSellerProfile = exports.updateSellerShop = exports.getSellerShop = exports.getSeller = exports.loginSeller = exports.createStripeConnectionLink = exports.createShop = exports.verifySeller = exports.registerSeller = exports.resetPassword = exports.verifyForgotPassword = exports.userForgotPassword = exports.getUser = exports.refreshToken = exports.loginUser = exports.verifyUser = exports.userRegistration = void 0;
const tslib_1 = __webpack_require__(1);
const error_handler_1 = __webpack_require__(9);
const prisma_1 = tslib_1.__importDefault(__webpack_require__(10));
const auth_helper_1 = __webpack_require__(12);
const bcryptjs_1 = tslib_1.__importDefault(__webpack_require__(19));
const setCookie_1 = __webpack_require__(20);
const jsonwebtoken_1 = tslib_1.__importStar(__webpack_require__(21));
const stripe_1 = tslib_1.__importDefault(__webpack_require__(22));
const stripe = new stripe_1.default(process.env.STRIPE_API_KEY, {
    apiVersion: "2025-09-30.clover",
});
//register new users
const userRegistration = async (req, res, next) => {
    try {
        (0, auth_helper_1.validateRegistrationData)(req.body, "user");
        const { name, email } = req.body;
        const existingUser = await prisma_1.default.users.findUnique({ where: { email } });
        if (existingUser) {
            return next(new error_handler_1.ValidationError("User with this email already exists"));
        }
        await (0, auth_helper_1.checkOtpRestrictions)(email, next);
        await (0, auth_helper_1.trackOtpRequests)(email, next);
        await (0, auth_helper_1.sendOtp)(name, email, "user-activation-email");
        res.status(200).send({ message: "OTP sent to your email" });
    }
    catch (error) {
        return next(error);
    }
};
exports.userRegistration = userRegistration;
//verify new users
const verifyUser = async (req, res, next) => {
    try {
        const { email, otp, password, name } = req.body;
        if (!email || !otp || !password || !name) {
            return next(new error_handler_1.ValidationError("All fields are required!"));
        }
        const existingUser = await prisma_1.default.users.findUnique({ where: { email } });
        if (existingUser) {
            return next(new error_handler_1.ValidationError("User already exists with this email!"));
        }
        await (0, auth_helper_1.verifyOtp)(email, otp);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await prisma_1.default.users.create({
            data: { name, email, password: hashedPassword },
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully!",
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.verifyUser = verifyUser;
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new error_handler_1.ValidationError("Email and password are required!"));
        }
        const user = await prisma_1.default.users.findUnique({ where: { email } });
        if (!user) {
            return next(new error_handler_1.ValidationError("Invalid email or password!"));
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return next(new error_handler_1.AuthenticationError("Invalid email or password!"));
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: "user" }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, role: "user" }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
        //store the refresh token
        (0, setCookie_1.setCookie)(res, "refreshToken", refreshToken);
        (0, setCookie_1.setCookie)(res, "accessToken", accessToken);
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.loginUser = loginUser;
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies["refreshToken"] ||
            req.headers["seller-refresh-token"] ||
            req.headers.authorization?.split(" ")[1];
        if (!token) {
            return next(new error_handler_1.AuthenticationError("No refresh token provided"));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded || !decoded.id || !decoded.role) {
            return new jsonwebtoken_1.JsonWebTokenError("Forbidden! Invalid refresh token.");
        }
        const user = await prisma_1.default.users.findUnique({ where: { id: decoded.id } });
        let account;
        if (decoded.role === "user") {
            account = await prisma_1.default.users.findUnique({ where: { id: decoded.id } });
        }
        else if (decoded.role === "seller") {
            account = await prisma_1.default.sellers.findUnique({
                where: { id: decoded.id },
                include: { shop: true },
            });
        }
        if (!account) {
            return next(new error_handler_1.AuthenticationError("Account not found"));
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        if (decoded.role === "user") {
            (0, setCookie_1.setCookie)(res, "accessToken", newAccessToken);
        }
        else if (decoded.role === "seller") {
            (0, setCookie_1.setCookie)(res, "seller-access-token", newAccessToken);
        }
        res.status(200).json({ message: "Access token refreshed" });
    }
    catch (error) {
        return next(error);
    }
};
exports.refreshToken = refreshToken;
const getUser = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getUser = getUser;
const userForgotPassword = async (req, res, next) => {
    await (0, auth_helper_1.handleForgotPassword)(req, res, next, "user");
};
exports.userForgotPassword = userForgotPassword;
const verifyForgotPassword = async (req, res, next) => {
    await (0, auth_helper_1.verifyForgotPasswordOtp)(req, res, next);
};
exports.verifyForgotPassword = verifyForgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next(new error_handler_1.ValidationError("Email and new password are required!"));
        }
        const user = await prisma_1.default.users.findUnique({ where: { email } });
        if (!user) {
            return next(new error_handler_1.ValidationError("No account found with this email"));
        }
        if (!user.password) {
            return next(new error_handler_1.ValidationError("User password not found"));
        }
        const isSamePassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (isSamePassword) {
            return next(new error_handler_1.ValidationError("New password must be different from the old password"));
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.users.update({
            where: { email },
            data: { password: hashedPassword },
        });
        res.status(200).json({ message: "Password reset successfully!" });
    }
    catch (error) {
        return next(error);
    }
};
exports.resetPassword = resetPassword;
const registerSeller = async (req, res, next) => {
    try {
        (0, auth_helper_1.validateRegistrationData)(req.body, "seller");
        const { name, email } = req.body;
        const existingSeller = await prisma_1.default.sellers.findUnique({
            where: { email },
        });
        if (existingSeller) {
            throw new error_handler_1.ValidationError("");
        }
        await (0, auth_helper_1.checkOtpRestrictions)(email, next);
        await (0, auth_helper_1.trackOtpRequests)(email, next);
        await (0, auth_helper_1.sendOtp)(name, email, "seller-activation");
        res.status(200).json({ message: "OTP sent to your email" });
    }
    catch (error) {
        return next(error);
    }
};
exports.registerSeller = registerSeller;
const verifySeller = async (req, res, next) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body;
        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new error_handler_1.ValidationError("All fields are required!"));
        }
        const existingSeller = await prisma_1.default.sellers.findUnique({
            where: { email },
        });
        if (existingSeller) {
            return next(new error_handler_1.ValidationError("Seller already exists with this email!"));
        }
        await (0, auth_helper_1.verifyOtp)(email, otp);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const seller = await prisma_1.default.sellers.create({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.verifySeller = verifySeller;
const createShop = async (req, res, next) => {
    try {
        const { name, bio, address, opening_hours, website, category, sellerId } = req.body;
        if (!name ||
            !bio ||
            !address ||
            !opening_hours ||
            !website ||
            !category ||
            !sellerId) {
            return next(new error_handler_1.ValidationError("All fields are required!"));
        }
        const shopData = {
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
        const shop = await prisma_1.default.shops.create({
            data: shopData,
        });
        res.status(201).json({
            success: true,
            shop,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.createShop = createShop;
const createStripeConnectionLink = async (req, res, next) => {
    try {
        const { sellerId } = req.body;
        if (!sellerId) {
            return next(new error_handler_1.ValidationError("Seller ID is required"));
        }
        const seller = await prisma_1.default.sellers.findUnique({ where: { id: sellerId } });
        if (!seller) {
            return next(new error_handler_1.ValidationError("Seller not found"));
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
        await prisma_1.default.sellers.update({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.createStripeConnectionLink = createStripeConnectionLink;
const loginSeller = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new error_handler_1.ValidationError("Email and password are required!"));
        }
        const seller = await prisma_1.default.sellers.findUnique({ where: { email } });
        if (!seller) {
            return next(new error_handler_1.ValidationError("Invalid email or password!"));
        }
        const isMatch = await bcryptjs_1.default.compare(password, seller.password);
        if (!isMatch) {
            return next(new error_handler_1.AuthenticationError("Invalid email or password!"));
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: seller.id, role: "seller" }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: seller.id, role: "seller" }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
        //store the refresh token
        (0, setCookie_1.setCookie)(res, "seller-refreshToken", refreshToken);
        (0, setCookie_1.setCookie)(res, "seller-accessToken", accessToken);
        res.status(200).json({
            message: "Login successful",
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
            },
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.loginSeller = loginSeller;
const getSeller = async (req, res, next) => {
    try {
        const seller = req.seller;
        res.status(200).json({
            success: true,
            seller,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getSeller = getSeller;
const getSellerShop = async (req, res, next) => {
    try {
        const sellerId = req.params.sellerId || req.seller?.id;
        if (!sellerId) {
            return next(new error_handler_1.ValidationError("Seller ID is required"));
        }
        const seller = await prisma_1.default.sellers.findUnique({
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
            return next(new error_handler_1.ValidationError("Seller not found"));
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
    }
    catch (error) {
        return next(error);
    }
};
exports.getSellerShop = getSellerShop;
const updateSellerShop = async (req, res, next) => {
    try {
        const sellerId = req.params.sellerId || req.seller?.id;
        const { shopName, bio, address, opening_hours, website, category, coverBanner, socialLinks, } = req.body;
        if (!sellerId) {
            return next(new error_handler_1.ValidationError("Seller ID is required"));
        }
        const seller = await prisma_1.default.sellers.findUnique({
            where: { id: sellerId },
            include: { shop: true },
        });
        if (!seller) {
            return next(new error_handler_1.ValidationError("Seller not found"));
        }
        let shop;
        if (seller.shop) {
            // Update existing shop
            const updateData = {};
            if (shopName !== undefined)
                updateData.name = shopName;
            if (bio !== undefined)
                updateData.bio = bio;
            if (address !== undefined)
                updateData.address = address;
            if (opening_hours !== undefined)
                updateData.opening_hours = opening_hours;
            if (website !== undefined)
                updateData.website = website;
            if (category !== undefined)
                updateData.category = category;
            if (coverBanner !== undefined)
                updateData.coverBanner = coverBanner;
            if (socialLinks !== undefined)
                updateData.socialLinks = socialLinks;
            shop = await prisma_1.default.shops.update({
                where: { id: seller.shop.id },
                data: updateData,
                include: {
                    avatar: true,
                },
            });
        }
        else {
            // Create new shop if doesn't exist
            if (!shopName || !address) {
                return next(new error_handler_1.ValidationError("Shop name and address are required to create a shop"));
            }
            shop = await prisma_1.default.shops.create({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.updateSellerShop = updateSellerShop;
const updateSellerProfile = async (req, res, next) => {
    try {
        const sellerId = req.params.sellerId || req.seller?.id;
        const { name, phone_number, country } = req.body;
        if (!sellerId) {
            return next(new error_handler_1.ValidationError("Seller ID is required"));
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (phone_number !== undefined)
            updateData.phone_number = phone_number;
        if (country !== undefined)
            updateData.country = country;
        const seller = await prisma_1.default.sellers.update({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.updateSellerProfile = updateSellerProfile;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RateLimitError = exports.DatabaseError = exports.ForbiddenError = exports.AuthenticationError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(message, statusCode, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);
    }
}
exports.AppError = AppError;
// Not found error
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
// Validation error
class ValidationError extends AppError {
    constructor(message = 'Validation error', details) {
        super(message, 400, true, details);
    }
}
exports.ValidationError = ValidationError;
// Authentication error
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', details) {
        super(message, 401, true, details);
    }
}
exports.AuthenticationError = AuthenticationError;
// Forbidden error
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden', details) {
        super(message, 403, true, details);
    }
}
exports.ForbiddenError = ForbiddenError;
// Database error
class DatabaseError extends AppError {
    constructor(message = 'Database error', details) {
        super(message, 500, false, details);
    }
}
exports.DatabaseError = DatabaseError;
// Rate limit error
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', details) {
        super(message, 429, true, details);
    }
}
exports.RateLimitError = RateLimitError;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const client_1 = __webpack_require__(11);
const prisma = new client_1.PrismaClient();
if (process.env.NODE_ENV === "production")
    globalThis.prismadb = prisma;
exports["default"] = prisma;


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.verifyForgotPasswordOtp = exports.handleForgotPassword = exports.verifyOtp = exports.sendOtp = exports.trackOtpRequests = exports.checkOtpRestrictions = exports.validateRegistrationData = void 0;
const tslib_1 = __webpack_require__(1);
const crypto_1 = tslib_1.__importDefault(__webpack_require__(13));
const error_handler_1 = __webpack_require__(9);
const sendMail_1 = __webpack_require__(14);
const redis_1 = tslib_1.__importDefault(__webpack_require__(17));
const prisma_1 = tslib_1.__importDefault(__webpack_require__(10));
// import { parse } from "path";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateRegistrationData = (data, userType) => {
    const { name, email, password, phone_number, country } = data;
    if (!name ||
        !email ||
        !password ||
        (userType === "seller" && (!phone_number || !country))) {
        throw new error_handler_1.ValidationError("Missing required fields");
    }
    if (!emailRegex.test(email)) {
        throw new error_handler_1.ValidationError("Invalid email format");
    }
};
exports.validateRegistrationData = validateRegistrationData;
const checkOtpRestrictions = async (email, next) => {
    if (await redis_1.default.get(`otp_lock:${email}`)) {
        throw new error_handler_1.ValidationError("Too many OTP requests. Please try again later.");
    }
    if (await redis_1.default.get(`otp_spam_lock:${email}`)) {
        throw new error_handler_1.ValidationError("Please wait before requesting another OTP.");
    }
    if (await redis_1.default.get(`otp_cooldown:${email}`)) {
        throw new error_handler_1.ValidationError("OTP already sent. Please wait.");
    }
};
exports.checkOtpRestrictions = checkOtpRestrictions;
const trackOtpRequests = async (email, next) => {
    const otpRequestKey = `otp_requests_count:${email}`;
    let otpRequests = parseInt((await redis_1.default.get(otpRequestKey)) || "0");
    // Only lock if more than 2 requests (i.e., on the 4th request)
    if (otpRequests > 2) {
        await redis_1.default.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // 1 hour spam lock
        throw new error_handler_1.ValidationError("Too many OTP requests. Please try again in an hour.");
    }
    await redis_1.default.set(otpRequestKey, (otpRequests + 1).toString(), "EX", 3600); // 1 hour window
};
exports.trackOtpRequests = trackOtpRequests;
const sendOtp = async (name, email, template) => {
    const otp = crypto_1.default.randomInt(1000, 9999).toString();
    await (0, sendMail_1.sendEmail)(email, "Verify your email", template, { name, otp });
    await redis_1.default.set(`otp:${email}`, otp, "EX", 300); // OTP valid for 5 minutes
    await redis_1.default.set(`otp_cooldown:${email}`, "true", "EX", 60); // 1 minute cooldown
};
exports.sendOtp = sendOtp;
const verifyOtp = async (email, otp) => {
    const failedAttemptsKey = `otp_failed_attempts:${email}`;
    const storedOtp = await redis_1.default.get(`otp:${email}`);
    if (!storedOtp) {
        throw new error_handler_1.ValidationError("OTP has expired. Please request a new one.");
    }
    const failedAttempts = parseInt((await redis_1.default.get(failedAttemptsKey)) || "0");
    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis_1.default.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock for 30 minutes
            await redis_1.default.del(`otp:${email}`);
            await redis_1.default.del(failedAttemptsKey);
            throw new error_handler_1.ValidationError("Too many failed attempts. Your account is locked for 30 minutes!");
        }
        await redis_1.default.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
        throw new error_handler_1.ValidationError(`Incorrect OTP. You have ${2 - failedAttempts} attempts left.`);
    }
    await redis_1.default.del(`otp:${email}`, failedAttemptsKey);
};
exports.verifyOtp = verifyOtp;
const handleForgotPassword = async (req, res, next, userType) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new error_handler_1.ValidationError("Email is required");
        }
        const user = userType === "user"
            ? await prisma_1.default.users.findUnique({ where: { email } })
            : await prisma_1.default.sellers.findUnique({ where: { email } });
        if (!user) {
            throw new error_handler_1.ValidationError("No account found with this email");
        }
        await (0, exports.checkOtpRestrictions)(email, next);
        await (0, exports.trackOtpRequests)(email, next);
        await (0, exports.sendOtp)(user.name, email, userType === "user"
            ? "user-forgot-password-mail"
            : "seller-forgot-password-mail");
        res.status(200).json({ message: "OTP sent to your email" });
    }
    catch (error) {
        return next(error);
    }
};
exports.handleForgotPassword = handleForgotPassword;
const verifyForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            throw new error_handler_1.ValidationError("Email and OTP are required");
        }
        await (0, exports.verifyOtp)(email, otp);
        res
            .status(200)
            .json({ message: "OTP verified. You can now reset your password." });
    }
    catch (error) {
        return next(error);
    }
};
exports.verifyForgotPasswordOtp = verifyForgotPasswordOtp;


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sendEmail = void 0;
const tslib_1 = __webpack_require__(1);
const nodemailer_1 = tslib_1.__importDefault(__webpack_require__(15));
const dotenv_1 = tslib_1.__importDefault(__webpack_require__(2));
const ejs_1 = tslib_1.__importDefault(__webpack_require__(16));
const path_1 = tslib_1.__importDefault(__webpack_require__(3));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
const renderEmailTemplate = async (templateName, data) => {
    const templatePath = path_1.default.join(process.cwd(), "apps", "auth-service", "src", "utils", "email-templates", `${templateName}.ejs`);
    return ejs_1.default.renderFile(templatePath, data);
};
// send email using nodemailer
const sendEmail = async (to, subject, templateName, data) => {
    try {
        const html = await renderEmailTemplate(templateName, data);
        await transporter.sendMail({
            from: "<${process.env.SMTP_USER}",
            to,
            subject,
            html,
        });
        return true;
    }
    catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
exports.sendEmail = sendEmail;


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("ejs");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const ioredis_1 = tslib_1.__importDefault(__webpack_require__(18));
const redis = new ioredis_1.default(process.env.REDIS_DATABASE_URI);
exports["default"] = redis;


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("ioredis");

/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setCookie = void 0;
const setCookie = (res, name, value) => {
    res.cookie(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' only works with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/", // ensure cookie is valid for all routes
    });
};
exports.setCookie = setCookie;


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("stripe");

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(21));
const client_1 = __webpack_require__(11);
const prisma = new client_1.PrismaClient();
const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies["accessToken"] ||
            req.cookies["seller-accessToken"] ||
            req.headers["seller-access-token"] ||
            req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } });
        }
        else if (decoded.role === "seller") {
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
    }
    catch (error) {
        return res.status(401).json({
            message: "Unauthorized",
            error: error.message || error,
        });
    }
};
exports["default"] = isAuthenticated;


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isUser = exports.isSeller = void 0;
const error_handler_1 = __webpack_require__(9);
const isSeller = (req, res, next) => {
    if (req.role !== "seller") {
        return next(new error_handler_1.AuthenticationError("Access denied: Seller only"));
    }
    next();
};
exports.isSeller = isSeller;
const isUser = (req, res, next) => {
    if (req.role !== "user") {
        return next(new error_handler_1.AuthenticationError("Access denied: User only"));
    }
    next();
};
exports.isUser = isUser;


/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("swagger-ui-express");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorMiddleware = void 0;
const index_1 = __webpack_require__(9);
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof index_1.AppError) {
        console.log(`Error occurred: ${req.method} ${req.url} - ${err.message}`);
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }
    console.log("Unhandled Error:", err);
    return res.status(500).json({
        error: "Internal Server Error",
    });
};
exports.errorMiddleware = errorMiddleware;


/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"swagger":"2.0","info":{"title":"Auth Service","description":"Authentication Service for E-Shop Application","version":"1.0.0"},"host":"localhost:6001","basePath":"/api","schemes":["http"],"paths":{"/user-registration":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"name":{"example":"any"},"email":{"example":"any"}}}}],"responses":{"200":{"description":"OK"}}}},"/verify-user":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"email":{"example":"any"},"otp":{"example":"any"},"password":{"example":"any"},"name":{"example":"any"}}}}],"responses":{"201":{"description":"Created"}}}},"/login-user":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"email":{"example":"any"},"password":{"example":"any"}}}}],"responses":{"200":{"description":"OK"}}}},"/forgot-password-user":{"post":{"description":"","responses":{"default":{"description":""}}}},"/verify-forgot-password-user":{"post":{"description":"","responses":{"default":{"description":""}}}},"/reset-password-user":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"email":{"example":"any"},"newPassword":{"example":"any"}}}}],"responses":{"200":{"description":"OK"}}}},"/seller-registration":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"name":{"example":"any"},"email":{"example":"any"}}}}],"responses":{"200":{"description":"OK"}}}},"/verify-seller":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"email":{"example":"any"},"otp":{"example":"any"},"password":{"example":"any"},"name":{"example":"any"},"phone_number":{"example":"any"},"country":{"example":"any"}}}}],"responses":{"201":{"description":"Created"}}}},"/create-shop":{"post":{"description":"","parameters":[{"name":"body","in":"body","schema":{"type":"object","properties":{"name":{"example":"any"},"bio":{"example":"any"},"address":{"example":"any"},"opening_hours":{"example":"any"},"website":{"example":"any"},"category":{"example":"any"},"sellerId":{"example":"any"}}}}],"responses":{"201":{"description":"Created"}}}}}}');

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const dotenv_1 = tslib_1.__importDefault(__webpack_require__(2));
const path_1 = tslib_1.__importDefault(__webpack_require__(3));
// Load environment variables from root .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../../.env") });
const express_1 = tslib_1.__importDefault(__webpack_require__(4));
const cors_1 = tslib_1.__importDefault(__webpack_require__(5));
// import { serve } from "swagger-ui-express";
// import { error } from 'console';
const cookie_parser_1 = tslib_1.__importDefault(__webpack_require__(6));
const auth_router_1 = tslib_1.__importDefault(__webpack_require__(7));
const swagger_ui_express_1 = tslib_1.__importDefault(__webpack_require__(25));
const error_middleware_1 = __webpack_require__(26);
const swaggerDocument = __webpack_require__(27);
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send({ message: "Hello API" });
});
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});
app.use("/api", auth_router_1.default);
app.use(error_middleware_1.errorMiddleware);
const port = process.env.PORT || 6001;
const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Auth service listening at http://0.0.0.0:${port}/api`);
    console.log(`Swagger docs at http://0.0.0.0:${port}/api-docs`);
});
server.on("error", (err) => {
    console.error("Error starting server:", err);
});

})();

/******/ })()
;