import express, { Application } from "express";

import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { tutorProfileRouter } from "./modules/tutorProfile/tutorProfile.router";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:5000", // client side url
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to SkillBridge API!");
});

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/tutor-profile", tutorProfileRouter);

export default app;
