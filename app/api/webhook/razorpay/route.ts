import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature." }, { status: 400 });
    }

    const rawBody = await req.text();
    const valid = verifyRazorpayWebhookSignature({
      body: rawBody,
      signature
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const body = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const event = body.event;
    const payment = body.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { razorpayOrderId: orderId }
    });
    if (!paymentRequest) {
      return NextResponse.json({ received: true });
    }

    if (event === "payment.captured") {
      await prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          paymentStatus: "SUCCESS",
          razorpayPaymentId: paymentId ?? paymentRequest.razorpayPaymentId
        }
      });
    }

    if (event === "payment.failed" && paymentRequest.paymentStatus !== "SUCCESS") {
      await prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: {
          paymentStatus: "FAILED",
          razorpayPaymentId: paymentId ?? paymentRequest.razorpayPaymentId
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
