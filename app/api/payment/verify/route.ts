import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, verifyRazorpayPaymentSignature } from "@/lib/razorpay";

type VerifyBody = {
  paymentRequestId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyBody;
    const paymentRequestId = body.paymentRequestId?.trim();
    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!paymentRequestId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId }
    });

    if (!paymentRequest) {
      return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    }

    if (paymentRequest.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        success: true,
        paymentRequestId: paymentRequest.id,
        paymentId: paymentRequest.razorpayPaymentId,
        amount: paymentRequest.amount
      });
    }

    if (!paymentRequest.razorpayOrderId || paymentRequest.razorpayOrderId !== orderId) {
      return NextResponse.json({ error: "Order mismatch." }, { status: 400 });
    }

    const isValidSignature = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature
    });
    if (!isValidSignature) {
      await prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: { paymentStatus: "FAILED" }
      });
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.fetch(orderId);
    if (order.amount !== paymentRequest.amount * 100) {
      return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });
    }

    const updated = await prisma.paymentRequest.update({
      where: { id: paymentRequestId },
      data: {
        paymentStatus: "SUCCESS",
        razorpayPaymentId: paymentId
      }
    });

    return NextResponse.json({
      success: true,
      paymentRequestId: updated.id,
      paymentId: updated.razorpayPaymentId,
      amount: updated.amount
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
