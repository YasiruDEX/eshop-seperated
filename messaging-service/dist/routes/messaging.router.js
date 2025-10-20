"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingRouter = void 0;
const express_1 = require("express");
const messaging_controller_1 = require("../controller/messaging.controller");
const router = (0, express_1.Router)();
exports.messagingRouter = router;
/**
 * @route   POST /messages
 * @desc    Send a new message
 * @body    { userId: string, sellerId: string, senderId: string, senderType: "user" | "seller", message: string }
 * @access  Public
 */
router.post("/", messaging_controller_1.sendMessage);
/**
 * @route   GET /messages/conversation/:userId/:sellerId
 * @desc    Get all messages between a user and seller
 * @access  Public
 */
router.get("/conversation/:userId/:sellerId", messaging_controller_1.getConversation);
/**
 * @route   GET /messages/user/:userId
 * @desc    Get all conversations for a user
 * @access  Public
 */
router.get("/user/:userId", messaging_controller_1.getUserConversations);
/**
 * @route   GET /messages/seller/:sellerId
 * @desc    Get all conversations for a seller
 * @access  Public
 */
router.get("/seller/:sellerId", messaging_controller_1.getSellerConversations);
/**
 * @route   PATCH /messages/read
 * @desc    Mark messages as read
 * @body    { userId: string, sellerId: string, readerId: string }
 * @access  Public
 */
router.patch("/read", messaging_controller_1.markMessagesAsRead);
/**
 * @route   GET /messages/:id
 * @desc    Get a specific message by ID
 * @access  Public
 */
router.get("/:id", messaging_controller_1.getMessageById);
/**
 * @route   DELETE /messages/:id
 * @desc    Delete a message by ID
 * @access  Public
 */
router.delete("/:id", messaging_controller_1.deleteMessage);
