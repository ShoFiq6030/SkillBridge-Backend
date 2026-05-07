import express, { Application, Request, Response, NextFunction } from "express";

import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { tutorProfileRouter } from "./modules/tutorProfile/tutorProfile.router";
import { availabilitySlotRouter } from "./modules/avaliabilitySlot/availabilitySlot.routers";
import { bookingRouter } from "./modules/booking/booking.routers";
import { categoriesRouter } from "./modules/category/category.router";
import { tutorSubjectRouter } from "./modules/tutorSubject/tutorSubject.router";
import { reviewsRouter } from "./modules/reviews/reviews.router";
import { adminRouter } from "./modules/admin/admin.routes";
import { notFound } from "./middlewares/notfound";
import errorHandler from "./middlewares/globalErrorHandler";
import { paymentRouter } from "./modules/payment/payment.router";
import { paymentController } from "./modules/payment/payment.controller";
import pusherRoutes from "./modules/pusher/pusher.routes";
import chatRoutes from "./modules/chat/chat.routes";

const app: Application = express();

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhookEvent,
);

// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  //  "http://localhost:3000",
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🌐 Request origin:", origin); // ✅ add this
      console.log("✅ Allowed origins:", allowedOrigins); // ✅ add this

      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error("❌ CORS rejected:", origin); // ✅ add this
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to SkillBridge API!");
});

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/tutor-profile", tutorProfileRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tutor-subject", tutorSubjectRouter);
app.use("/api/availability-slot", availabilitySlotRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/pusher", pusherRoutes);

// 404 handler for unmatched routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
