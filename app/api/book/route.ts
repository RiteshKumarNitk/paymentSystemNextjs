import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/payment";
import { checkRateLimit } from "@/lib/rateLimit";

function generateOrderId() {
    return `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = checkRateLimit(`book:${ip}`);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: `Too many requests. Try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` },
            { status: 429 }
        );
    }

    try {
        const body = (await req.json()) as {
            eventId: string;
            name: string;
            phone: string;
            email: string;
        };

        const name = body.name?.trim();
        const phone = normalizePhone(body.phone);
        const email = body.email?.trim().toLowerCase();
        const eventId = body.eventId?.trim();

        if (!name || !phone || !email || !eventId) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return NextResponse.json({ error: "Event not found." }, { status: 404 });
        }
        if (!event.isActive) {
            return NextResponse.json({ error: "This event is no longer available." }, { status: 400 });
        }

        // Capacity check
        if (event.capacity > 0) {
            const confirmedCount = await prisma.booking.count({
                where: {
                    eventId,
                    status: { notIn: ["rejected", "cancelled"] }
                }
            });
            if (confirmedCount >= event.capacity) {
                return NextResponse.json({ error: "Sorry, this event is sold out." }, { status: 400 });
            }
        }

        const memberId = req.cookies.get("member_token")?.value ?? null;
        const orderId = generateOrderId();
        const isFree = event.price === 0;

        const booking = await prisma.booking.create({
            data: {
                orderId,
                name,
                phone,
                email,
                amount: event.price,
                status: isFree ? "confirmed" : "pending",
                eventId,
                memberId
            }
        });

        return NextResponse.json({
            bookingId: booking.id,
            orderId: booking.orderId,
            isFree,
            status: booking.status
        });
    } catch (error) {
        console.error("Booking failed:", error);
        return NextResponse.json({ error: "Unable to create booking." }, { status: 500 });
    }
}
