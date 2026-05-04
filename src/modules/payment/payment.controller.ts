import { NextFunction, Request, Response } from "express";
import { paymentService } from "./payment.service";
import { stripe } from "../../config/stripe.config";

const paymentSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { bookingId } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(400).json({
      error: "Unauthorized!",
    });
  }

  try {
    const paymentResult = await paymentService.processPayment(bookingId, user);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.message || "Payment processing failed",
      });
    }

    // console.log(paymentResult.url);
    res.status(200).json(paymentResult);
  } catch (error) {
    next(error);
  }
};
const paymentSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tran_id } = req.params;

    const result = await paymentService.paymentSuccessService(
      tran_id as string,
    );
    if (result.success) {
      res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?tran_id=${tran_id}`,
      );
    }
  } catch (error) {
    next(error);
  }
};

const paymentFailed = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tran_id, bookingId } = req.params;
    const result = await paymentService.paymentFailedService(
      tran_id as string,
      bookingId as string,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createStripeCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    const result = await paymentService.createStripeCheckoutSessionService(
      bookingId,
      user,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  console.log("🔔 Webhook endpoint hit!");
  console.log("📍 Path: /api/payment/webhook");
  
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  console.log("🔑 Signature present:", !!signature);
  console.log("🔐 Webhook secret present:", !!webhookSecret);

  if (!signature || !webhookSecret) {
    console.error("❌ Missing Stripe signature or webhook secret");
    return res
      .status(400)
      .json({ message: "Missing Stripe signature or webhook secret" });
  }

  let event;

  try {
    console.log("🔄 Constructing event with signature verification...");
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    console.log("✅ Event constructed:", event.type);
  } catch (error: any) {
    console.error("❌ Error processing Stripe webhook:", error.message);
    return res.status(400).json({ message: "Error processing Stripe webhook" });
  }

  try {
    const result = await paymentService.handlerStripeWebhookEvent(event);

    res.status(200).json({
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    res.status(500).json({
      success: false,
      message: "Error handling Stripe webhook event",
    });
  }
};

const getPaymentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { providerTransactionId } = req.params;

    if (!providerTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Provider transaction ID is required",
      });
    }

    const result =
      await paymentService.getPaymentDetailsByProviderTransactionId(
        providerTransactionId as string,
      );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const paymentController = {
  paymentSubmission,
  paymentSuccess,
  paymentFailed,
  createStripeCheckoutSession,
  handleStripeWebhookEvent,
  getPaymentDetails,
};
