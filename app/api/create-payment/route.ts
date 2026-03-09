import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderId, normalizeAmountRupees, normalizePhone } from "@/lib/payment";
import { checkRateLimit } from "@/lib/rateLimit";

type CreatePaymentBody = {
  name: string;
  phone: string;
  email: string;
  purpose: string;
  amount: number;
  formId?: string;
};

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`create-payment:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as CreatePaymentBody;
    const name = body.name?.trim();
    const phone = normalizePhone(body.phone);
    const email = body.email?.trim().toLowerCase();
    const formId = body.formId ?? null;

    if (!name || !phone || !email) {
      return NextResponse.json({ error: "Name, phone and email are required." }, { status: 400 });
    }

    // Resolve linked form if formId provided
    let purpose = body.purpose?.trim() || "payment";
    let finalAmount = normalizeAmountRupees(body.amount);

    if (formId) {
      const form = await prisma.paymentForm.findUnique({ where: { id: formId } });
      if (!form) {
        return NextResponse.json({ error: "Payment form not found." }, { status: 404 });
      }
      if (!form.isActive) {
        return NextResponse.json({ error: "This payment form is no longer active." }, { status: 400 });
      }
      purpose = form.title;
      // Use fixed amount from form if set
      if (form.amount > 0) {
        finalAmount = form.amount;
      }
    }

    const memberId = req.cookies.get("member_token")?.value ?? null;
    const orderId = generateOrderId();

    const payment = await prisma.userPayment.create({
      data: {
        orderId,
        name,
        phone,
        email,
        purpose,
        amount: finalAmount,
        status: "pending",
        formId,
        memberId
      }
    });

    return NextResponse.json({ orderId: payment.orderId });
  } catch (error) {
    console.error("Create payment failed:", error);
    return NextResponse.json({ error: "Unable to create payment request." }, { status: 500 });
  }
}
