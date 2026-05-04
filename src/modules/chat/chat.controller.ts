// src/modules/chat/chat.controller.ts
import { Request, Response } from "express";
import * as chatService from "./chat.service";
import { success } from "better-auth/*";

// GET /api/chat/room/:bookingId
export const getChatRoom = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const userId = req.user.id;

    const room = await chatService.getChatRoomByBookingId(
      bookingId as string,
      userId,
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found. Booking may not be confirmed yet.",
      });
    }

    res.json({ success: true, data: room });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/chat/messages/:chatRoomId
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatRoomId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.id;

    const messages = await chatService.getMessagesByRoomId(
      chatRoomId as string,
      userId,
    );

    if (!messages) {
      return res.status(404).json({ success: false, message: "Chat room not found." });
    }

    res.json({ success: true, data: messages });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// POST /api/chat/messages
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatRoomId, content } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const senderId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    const message = await chatService.sendMessage(
      chatRoomId as string,
      senderId,
      content,
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Chat room not found." });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
