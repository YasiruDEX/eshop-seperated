import { Router } from "express";
import {
  sendMessage,
  getConversation,
  getUserConversations,
  getSellerConversations,
  markMessagesAsRead,
  deleteMessage,
  getMessageById,
} from "../controller/messaging.controller";

const router = Router();

/**
 * @route   POST /messages
 * @desc    Send a new message
 * @body    { userId: string, sellerId: string, senderId: string, senderType: "user" | "seller", message: string }
 * @access  Public
 */
router.post("/", sendMessage);

/**
 * @route   GET /messages/conversation/:userId/:sellerId
 * @desc    Get all messages between a user and seller
 * @access  Public
 */
router.get("/conversation/:userId/:sellerId", getConversation);

/**
 * @route   GET /messages/user/:userId
 * @desc    Get all conversations for a user
 * @access  Public
 */
router.get("/user/:userId", getUserConversations);

/**
 * @route   GET /messages/seller/:sellerId
 * @desc    Get all conversations for a seller
 * @access  Public
 */
router.get("/seller/:sellerId", getSellerConversations);

/**
 * @route   PATCH /messages/read
 * @desc    Mark messages as read
 * @body    { userId: string, sellerId: string, readerId: string }
 * @access  Public
 */
router.patch("/read", markMessagesAsRead);

/**
 * @route   GET /messages/:id
 * @desc    Get a specific message by ID
 * @access  Public
 */
router.get("/:id", getMessageById);

/**
 * @route   DELETE /messages/:id
 * @desc    Delete a message by ID
 * @access  Public
 */
router.delete("/:id", deleteMessage);

export { router as messagingRouter };
