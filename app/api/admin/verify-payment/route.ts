import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type VerifyBody = {
  orderId: string;
  action: "verify" | "reject";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyBody;
    const orderId = body.orderId?.trim();
    const action = body.action;

    if (!orderId || !["verify", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const payment = await prisma.userPayment.findUnique({
      where: { orderId }
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    }

    if (payment.status === "verified" && action === "verify") {
      return NextResponse.json({ success: true, status: payment.status });
    }

    const updated = await prisma.userPayment.update({
      where: { orderId },
      data: {
        status: action === "verify" ? "verified" : "rejected"
      }
    });

    return NextResponse.json({
      success: true,
      orderId: updated.orderId,
      status: updated.status
    });
  } catch (error) {
    console.error("Admin verification failed:", error);
    return NextResponse.json({ error: "Unable to update payment status." }, { status: 500 });
  }
}
