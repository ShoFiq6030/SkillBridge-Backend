import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = express.Router();

router.post("/process-payment", auth(), paymentController.paymentSubmission);
router.post(
  "/create-stripe-checkout-session",
  auth(),
  paymentController.createStripeCheckoutSession,
);

router.post("/success/:tran_id", paymentController.paymentSuccess);
router.post("/fail/:tran_id/:bookingId", paymentController.paymentFailed);

router.get(
  "/details/:providerTransactionId",
  auth(),
  paymentController.getPaymentDetails,
);

// router.get("/get-payment-info/:tran_id", auth(), getPaymentInfoWithTransactionId)
// router.get("/payment-info", auth(), getPaymentInfoByUserIdAndContestId)

export const paymentRouter = router;
