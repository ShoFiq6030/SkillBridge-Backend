// src/modules/webhook/webhook.controller.ts
import { Request, Response } from "express";

import { createChatRoom } from "../chat/chat.service";
import { stripe } from "../../config/stripe.config";
import { prisma } from "../../lib/prisma";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const bookingId = session.metadata.bookingId;

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Update Payment to SUCCESS
        await tx.payment.update({
          where: { bookingId },
          data: {
            status: "SUCCESS",
            transactionId: session.id,
            paidAt: new Date(),
          },
        });

        // 2. Confirm Booking
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        });

        // 3. Lock the Slot
        await tx.availabilitySlot.update({
          where: { id: booking.slotId },
          data: { isBooked: true },
        });

        // 4. Create ChatRoom
        await createChatRoom(
          bookingId,
          booking.studentId,
          booking.tutorProfileId  // adjust to your actual tutor userId field
        );
      });
    } catch (err) {
      console.error("Webhook transaction failed:", err);
      return res.status(500).json({ message: "Webhook processing failed." });
    }
  }

  res.json({ received: true });
};