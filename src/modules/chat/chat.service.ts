// src/modules/chat/chat.service.ts

import pusher from "../../config/pusher";
import { prisma } from "../../lib/prisma";

// ── Create chat room (called from webhook) ─────────────────────────────────
export const createChatRoom = async (
  bookingId: string,
  studentId: string,
  tutorId: string,
) => {
  return prisma.chatRoom.upsert({
    where: { bookingId },
    update: {},
    create: {
      bookingId,
      studentId,
      tutorId,
    },
  });
};

// ── Get chat room by bookingId ─────────────────────────────────────────────
export const getChatRoomByBookingId = async (
  bookingId: string,
  userId: string,
) => {
  const room = await prisma.chatRoom.findUnique({
    where: { bookingId },
    include: { booking: true },
  });

  if (!room) return null;

  const isParticipant = room.studentId === userId || room.tutorId === userId;
  if (!isParticipant) throw new Error("FORBIDDEN");

  return room;
};

// ── Get messages by chatRoomId ─────────────────────────────────────────────
export const getMessagesByRoomId = async (
  chatRoomId: string,
  userId: string,
) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!room) return null;

  const isParticipant = room.studentId === userId || room.tutorId === userId;
  if (!isParticipant) throw new Error("FORBIDDEN");

  return prisma.message.findMany({
    where: { chatRoomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
  });
};

// ── Send message + trigger Pusher ──────────────────────────────────────────
export const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  content: string,
) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!room) return null;

  const isParticipant =
    room.studentId === senderId || room.tutorId === senderId;
  if (!isParticipant) throw new Error("FORBIDDEN");

  const message = await prisma.message.create({
    data: {
      chatRoomId,
      senderId,
      content: content.trim(),
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  // Trigger Pusher event
  await pusher.trigger(`private-chat-${chatRoomId}`, "new-message", {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    sender: message.sender,
    createdAt: message.createdAt,
  });

  return message;
};

export const getAllChatRoomsForUserService = async (userId: string) => {
  console.log(userId);
  const rooms = await prisma.chatRoom.findMany({
    where: {
      OR: [{ studentId: userId }, { tutorId: userId }],
    },
    include: {
      booking: {
        include: {
          slot: true,
          tutorSubject: {
            include: {
              category: true,
            },
          },
        },
      },
      student: {
        select: { id: true, name: true, image: true },
      },
      tutor: {
        select: { id: true, name: true, image: true },
      },
      messages:{
        orderBy: { createdAt: "desc" },
        take: 1,
      }
    },
  });
  console.log(rooms);
  return rooms;
};
