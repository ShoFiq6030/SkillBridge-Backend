// src/modules/chat/chat.routes.ts
import { Router } from "express";

import * as chatController from "./chat.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get("/room/:bookingId", auth(), chatController.getChatRoom);
router.get("/messages/:chatRoomId", auth(), chatController.getMessages);
router.post("/messages", auth(), chatController.sendMessage);

export default router;
