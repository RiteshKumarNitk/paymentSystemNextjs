import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeAmountRupees } from "@/lib/payment";
import { getRazorpayClient, razorpayPublicConfig } from "@/lib/razorpay";

type CreatePaymentBody = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ticketType: string;
  amount: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePaymentBody;
    const customerName = body.customerName?.trim();
    const customerPhone = body.customerPhone?.trim();
    const customerEmail = body.customerEmail?.trim();
    const ticketType = body.ticketType?.trim();
    const amount = normalizeAmountRupees(body.amount);

    if (!customerName || !customerPhone || !customerEmail || !ticketType) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        ticketType,
        amount,
        paymentStatus: "PENDING"
      }
    });

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: paymentRequest.id.slice(0, 40),
      notes: {
        paymentRequestId: paymentRequest.id,
        customerName,
        ticketType
      }
    });

    await prisma.paymentRequest.update({
      where: { id: paymentRequest.id },
      data: { razorpayOrderId: order.id }
    });

    return NextResponse.json({
      paymentId: paymentRequest.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: razorpayPublicConfig.keyId
    });
  } catch (error) {
    console.error("Create payment failed:", error);
    return NextResponse.json({ error: "Unable to create payment request." }, { status: 500 });
  }
}
