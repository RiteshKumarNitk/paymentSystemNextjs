import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUtr } from "@/lib/payment";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`submit-utr:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as { orderId: string; utr: string };
    const orderId = body.orderId?.trim();
    const utr = normalizeUtr(body.utr);

    if (!orderId || !utr) {
      return NextResponse.json({ error: "orderId and UTR are required." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { orderId } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.status === "confirmed") {
      return NextResponse.json({ error: "Booking is already confirmed." }, { status: 400 });
    }

    // Duplicate UTR check
    const existingUtr = await prisma.booking.findFirst({
      where: { utr, NOT: { orderId } }
    });
    if (existingUtr) {
      return NextResponse.json(
        { error: "This UTR has already been used for another booking." },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { orderId },
      data: { utr, status: "pending_verification" }
    });

    return NextResponse.json({ success: true, orderId: updated.orderId, status: updated.status });
  } catch (error) {
    console.error("Submit UTR failed:", error);
    return NextResponse.json({ error: "Unable to submit UTR." }, { status: 500 });
  }
}
