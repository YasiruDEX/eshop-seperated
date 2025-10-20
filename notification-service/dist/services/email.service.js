"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConnection = exports.sendWishlistNotification = exports.sendOrderConfirmation = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Email Service using SMTP
 * Sends emails using nodemailer with credentials from .env
 */
// Create reusable transporter
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
};
/**
 * Send Order Confirmation Email
 * @param email - Recipient email address
 * @param orderNumber - Order number to include in email
 */
const sendOrderConfirmation = async (email, orderNumber) => {
    try {
        console.log(`📧 Sending order confirmation to: ${email}`);
        console.log(`📦 Order Number: ${orderNumber}`);
        // Read HTML template - use correct path for built code
        const templatePath = path.join(__dirname, "templates/order-confirmation.html");
        let htmlContent = fs.readFileSync(templatePath, "utf-8");
        // Replace placeholder with actual order number
        htmlContent = htmlContent.replace("{{ORDER_NUMBER}}", orderNumber);
        // Create transporter
        const transporter = createTransporter();
        // Send email
        const info = await transporter.sendMail({
            from: `"E-Shop" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Order Confirmation #${orderNumber} - E-Shop`,
            html: htmlContent,
        });
        console.log("✅ Email sent successfully:", info.messageId);
        return {
            success: true,
            message: `Order confirmation email sent to ${email}`,
        };
    }
    catch (error) {
        console.error("❌ Error sending order confirmation email:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
};
exports.sendOrderConfirmation = sendOrderConfirmation;
/**
 * Send Wishlist Notification Email
 * @param email - Recipient email address
 * @param itemName - Name of the item added to wishlist
 */
const sendWishlistNotification = async (email, itemName) => {
    try {
        console.log(`📧 Sending wishlist notification to: ${email}`);
        console.log(`💝 Item: ${itemName}`);
        // Read HTML template - use correct path for built code
        const templatePath = path.join(__dirname, "templates/wishlist.html");
        let htmlContent = fs.readFileSync(templatePath, "utf-8");
        // Replace placeholder with actual item name
        htmlContent = htmlContent.replace("{{ITEM_NAME}}", itemName);
        // Create transporter
        const transporter = createTransporter();
        // Send email
        const info = await transporter.sendMail({
            from: `"E-Shop" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `❤️ ${itemName} added to your wishlist - E-Shop`,
            html: htmlContent,
        });
        console.log("✅ Email sent successfully:", info.messageId);
        return {
            success: true,
            message: `Wishlist notification email sent to ${email}`,
        };
    }
    catch (error) {
        console.error("❌ Error sending wishlist notification email:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
};
exports.sendWishlistNotification = sendWishlistNotification;
/**
 * Verify SMTP connection
 */
const verifyEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log("✅ SMTP connection verified");
        return true;
    }
    catch (error) {
        console.error("❌ SMTP connection failed:", error);
        return false;
    }
};
exports.verifyEmailConnection = verifyEmailConnection;
