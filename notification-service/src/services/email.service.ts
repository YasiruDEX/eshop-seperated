import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

/**
 * Email Service using SMTP
 * Sends emails using nodemailer with credentials from .env
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
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
export const sendOrderConfirmation = async (
  email: string,
  orderNumber: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`📧 Sending order confirmation to: ${email}`);
    console.log(`📦 Order Number: ${orderNumber}`);

    // Read HTML template - use correct path for built code
    const templatePath = path.join(
      __dirname,
      "templates/order-confirmation.html"
    );
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
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Send Wishlist Notification Email
 * @param email - Recipient email address
 * @param itemName - Name of the item added to wishlist
 */
export const sendWishlistNotification = async (
  email: string,
  itemName: string
): Promise<{ success: boolean; message: string }> => {
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
  } catch (error) {
    console.error("❌ Error sending wishlist notification email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Verify SMTP connection
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ SMTP connection verified");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
    return false;
  }
};
