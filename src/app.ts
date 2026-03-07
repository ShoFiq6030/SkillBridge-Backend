import express, { Application, Request, Response, NextFunction } from "express";

import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { tutorProfileRouter } from "./modules/tutorProfile/tutorProfile.router";
import { availabilitySlotRouter } from "./modules/avaliabilitySlot/availabilitySlot.routers";
import { bookingRouter } from "./modules/booking/booking.routers";
import { categoriesRouter } from "./modules/category/category.router";
import { tutorSubjectRouter } from "./modules/tutorSubject/tutorSubject.router";
import { notFound } from "./middlewares/notfound";
import errorHandler from "./middlewares/globalErrorHandler";

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
app.use("/api/booking", bookingRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tutor-subject", tutorSubjectRouter);
app.use("/api/availability-slot", availabilitySlotRouter);

// 404 handler for unmatched routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
