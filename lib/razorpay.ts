import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpayKeyId() {
  const value = process.env.RAZORPAY_KEY_ID;
  if (!value) {
    throw new Error("Missing RAZORPAY_KEY_ID in environment variables.");
  }
  return value;
}

function getRazorpayKeySecret() {
  const value = process.env.RAZORPAY_KEY_SECRET;
  if (!value) {
    throw new Error("Missing RAZORPAY_KEY_SECRET in environment variables.");
  }
  return value;
}

export function getRazorpayClient() {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret()
  });
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const payload = `${input.orderId}|${input.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", getRazorpayKeySecret())
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(input.signature));
}

export function verifyRazorpayWebhookSignature({
  body,
  signature
}: {
  body: string;
  signature: string;
}) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET in environment variables.");
  }

  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export const razorpayPublicConfig = {
  keyId: process.env.RAZORPAY_KEY_ID ?? ""
};
