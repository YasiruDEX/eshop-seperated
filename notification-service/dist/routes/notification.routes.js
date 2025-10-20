"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controllers/notification.controller");
const router = express_1.default.Router();
/**
 * @route   POST /notifications/order-confirmation
 * @desc    Send order confirmation email
 * @body    { email: string, orderNumber: string }
 * @access  Public
 */
router.post("/order-confirmation", notification_controller_1.sendOrderConfirmationEmail);
/**
 * @route   POST /notifications/wishlist
 * @desc    Send wishlist notification email
 * @body    { email: string, itemName: string }
 * @access  Public
 */
router.post("/wishlist", notification_controller_1.sendWishlistEmail);
exports.default = router;
