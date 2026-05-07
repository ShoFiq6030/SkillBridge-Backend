// src/modules/pusher/pusher.routes.ts
import { Router, Request, Response } from "express";
import pusher from "../../config/pusher";

import auth from "../../middlewares/auth";

const router = Router();

// POST /api/pusher/auth
router.post("/auth", auth(), (req: Request, res: Response) => {
  console.log(req.cookies);
  const { socket_id, channel_name } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!socket_id || !channel_name) {
    return res
      .status(400)
      .json({ message: "socket_id and channel_name are required" });
  }

  const userId = req.user.id;

  const auth = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: userId,
  });

  res.json(auth);
});

export default router;
