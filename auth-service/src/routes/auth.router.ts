import express, { Router } from "express";
import {
  createShop,
  createStripeConnectionLink,
  getSeller,
  getSellerShop,
  getUser,
  loginSeller,
  loginUser,
  refreshToken,
  registerSeller,
  resetPassword,
  updateSellerProfile,
  updateSellerShop,
  userForgotPassword,
  userRegistration,
  verifyForgotPassword,
  verifySeller,
  verifyUser,
} from "../controller/auth.controller";
import { register } from "module";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/autherizeRoles";

const router: Router = express.Router();

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

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
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
router.post("/forgot-password-user", userForgotPassword);
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
router.post("/verify-forgot-password-user", verifyForgotPassword);
router.post("/reset-password-user", resetPassword);

router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectionLink);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.get("/seller-shop/:sellerId", getSellerShop);
router.put("/seller-shop/:sellerId", updateSellerShop);
router.put("/seller-profile/:sellerId", updateSellerProfile);

export default router;
