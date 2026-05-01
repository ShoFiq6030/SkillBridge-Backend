// eslint-disable-next-line @typescript-eslint/no-var-requires
import SSLCommerzPayment from "sslcommerz-lts";
import { User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import { stripe as stripeConfig } from "../../config/stripe.config";
import Stripe from "stripe";

const generateTransactionId = () =>
  `REF-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

const processPayment = async (bookingId: string, user: Partial<User>) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutorSubject: {
        include: { category: true },
      },
    },
  });

  if (!booking) {
    return {
      success: false,
      message: "Booking not found",
    };
  }

  if (!user.name || !user.email) {
    return {
      success: false,
      message: "User information is incomplete",
    };
  }

  const existingPaymentInfo = await prisma.payment.findUnique({
    where: { bookingId: booking.id },
  });

  const internalTransactionId =
    existingPaymentInfo?.transactionId || generateTransactionId();
  const providerTransactionId =
    existingPaymentInfo?.providerTransactionId ||
    `SSLCOMMERZ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

  const data = {
    total_amount: Number(booking.price || 1),
    currency: "BDT",
    tran_id: providerTransactionId,
    success_url: `http://localhost:5000/api/payment/success/${providerTransactionId}`,
    fail_url: `http://localhost:5000/api/payment/fail/${providerTransactionId}/${bookingId}`,
    cancel_url: `http://localhost:5000/api/payment/fail/${providerTransactionId}/${bookingId}`,
    ipn_url: `http://localhost:5000/ipn/${providerTransactionId}`,
    shipping_method: "online",
    product_name: booking.tutorSubject.category.name,
    product_category: booking.tutorSubject.category.name,
    product_profile: "general",
    cus_name: user.name,
    cus_email: user.email,
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  const ssl_commerz_store_id = process.env.SSL_COMMERZ_STORE_ID || "";
  const ssl_commerz_store_password = process.env.SSL_COMMERZ_STORE_PASSWD || "";
  const is_live = false;
  const sslcz = new SSLCommerzPayment(
    ssl_commerz_store_id,
    ssl_commerz_store_password,
    is_live,
  );

  try {
    const apiResponse = await sslcz.init(data);

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        transactionId: internalTransactionId,
        providerTransactionId,
        amount: Number(booking.price || 1),
        currency: booking.currency || "BDT",
        status: "PENDING",
        provider: "SSLCOMMERZ",
        paymentMethod: "ONLINE",
      },
      create: {
        bookingId: booking.id,
        transactionId: internalTransactionId,
        providerTransactionId,
        amount: Number(booking.price || 1),
        currency: booking.currency || "BDT",
        status: "PENDING",
        provider: "SSLCOMMERZ",
        paymentMethod: "ONLINE",
      },
    });

    return {
      success: true,
      url: apiResponse.GatewayPageURL,
      tran_id: providerTransactionId,
      status: payment.status,
    };
  } catch (err: any) {
    return { success: false, message: err.message || "payment init failed" };
  }
};

const paymentSuccessService = async (providerTransactionId: string) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { providerTransactionId },
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
      };
    }

    await prisma.payment.update({
      where: { providerTransactionId },
      data: {
        status: "SUCCESS",
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CONFIRMED",
      },
    });

    return { success: true, message: "Payment successful" };
  } catch (err: any) {
    return { success: false, message: err.message || "Payment update failed" };
  }
};

const paymentFailedService = async (
  providerTransactionId: string,
  bookingId: string,
) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { providerTransactionId },
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
      };
    }

    await prisma.payment.update({
      where: { providerTransactionId },
      data: {
        status: "FAILED",
      },
    });

    return { success: true, message: "Payment failed" };
  } catch (err: any) {
    return { success: false, message: err.message || "Payment update failed" };
  }
};

export const createStripeCheckoutSessionService = async (
  bookingId: string,
  user: { id: string; email: string },
) => {
  // 1️⃣ Validate booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutorSubject: {
        include: { category: true },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // 2️⃣ Ownership check (very important)
  if (booking.studentId !== user.id) {
    throw new Error("Unauthorized access to booking");
  }

  // 3️⃣ Prevent paying again
  if (booking.status !== "PENDING") {
    throw new Error("Booking is not payable");
  }

  // 4️⃣ Create Stripe session
  const session = await stripeConfig.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.tutorSubject?.category?.name || "Tutoring Session",
          },
          unit_amount: Number(booking.price) * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/payment-success?providerTransactionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-failed?providerTransactionId={CHECKOUT_SESSION_ID}`,
    metadata: {
      bookingId: booking.id,
      userId: user.id,
    },
  });
  console.log("Stripe session id:", session.id);
  if (!session.id) {
    throw new Error("Failed to create Stripe session");
  }

  const internalTransactionId = generateTransactionId();
  const providerPaymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  await prisma.payment.upsert({
    where: { bookingId },
    update: {
      providerTransactionId: session.id,
      providerPaymentIntentId,
      status: "PENDING",
      provider: "STRIPE",
      paymentMethod: "CARD",
    },
    create: {
      bookingId: booking.id,
      transactionId: internalTransactionId,
      providerTransactionId: session.id,
      providerPaymentIntentId,
      amount: Number(booking.price),
      currency: booking.currency || "USD",
      status: "PENDING",
      provider: "STRIPE",
      paymentMethod: "CARD",
    },
  });

  return {
    success: true,
    url: session.url,
    sessionId: session.id,
  };
};

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  //  console.log("event:",event);
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const providerTransactionId = session.id;
      console.log("providerTransactionId:", providerTransactionId);
      const bookingId = session.metadata?.bookingId as string | undefined;

      if (!providerTransactionId) {
        return { message: "Missing Stripe session id" };
      }

      if (!bookingId) {
        return { message: "Missing booking id" };
      }

      const payment = await prisma.payment.findUnique({
        where: {
          bookingId,
        },
      });

      if (!payment) {
        console.error(`Payment record for booking ${bookingId} not found`);
        return {
          message: `Payment record for booking ${bookingId} not found`,
        };
      }

      if (payment.status === "SUCCESS") {
        return {
          message: `Payment for booking ${bookingId} is already completed`,
        };
      }

      const providerPaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: {
            bookingId,
          },
          data: {
            status: session.payment_status === "paid" ? "SUCCESS" : "FAILED",
            providerPaymentIntentId,
            gatewayData: session as any,
          },
        });

        if (bookingId && session.payment_status === "paid") {
          await tx.booking.update({
            where: {
              id: bookingId,
            },
            data: {
              status: "CONFIRMED",
            },
          });
        }
      });

      return {
        message: `Processed checkout.session.completed for booking: ${bookingId}`,
      };
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const providerTransactionId = session.id;

      if (providerTransactionId) {
        await prisma.payment.update({
          where: { providerTransactionId },
          data: { status: "FAILED" },
        });
      }

      return {
        message: `Checkout session ${providerTransactionId} expired`,
      };
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findUnique({
        where: { providerPaymentIntentId: paymentIntent.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { providerPaymentIntentId: paymentIntent.id },
          data: { status: "FAILED" },
        });
      }

      return {
        message: `Payment intent ${paymentIntent.id} failed`,
      };
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      return { message: `Unhandled event type ${event.type}` };
  }
};

const getPaymentDetailsByProviderTransactionId = async (
  providerTransactionId: string,
) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { providerTransactionId },
      include: {
        booking: {
          include: {
            tutorSubject: {
              include: {
                category: true,
                tutorProfile: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
            slot: {
              include: {
                tutorProfile: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
      };
    }

    return {
      success: true,
      data: payment,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch payment details",
    };
  }
};

export const paymentService = {
  processPayment,
  paymentSuccessService,
  paymentFailedService,
  createStripeCheckoutSessionService,
  handlerStripeWebhookEvent,
  getPaymentDetailsByProviderTransactionId,
};
