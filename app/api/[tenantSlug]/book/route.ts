import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLoggedInMemberBySlug } from "@/lib/member";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;

        // 1. Rate Limiting
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        if (!rateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
        }

        // 2. Resolve Tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const { eventId, name, phone, email, amount } = await request.json();

        // 3. Fetch Event within Tenant
        const event = await prisma.event.findFirst({
            where: { id: eventId, tenantId: tenant.id },
            include: {
                _count: { select: { bookings: { where: { status: "confirmed" } } } }
            }
        });

        if (!event || !event.isActive) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // 4. Check Capacity
        if (event.capacity > 0 && event._count.bookings >= event.capacity) {
            return NextResponse.json({ error: "Sold out" }, { status: 400 });
        }

        // 5. Auth Member (optional)
        const member = await getLoggedInMemberBySlug(tenantSlug);

        // 6. Create Booking
        const orderId = `EP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const booking = await prisma.booking.create({
            data: {
                orderId,
                name,
                phone,
                email,
                amount,
                status: amount === 0 ? "confirmed" : "pending",
                eventId,
                memberId: member?.id || null,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ bookingId: booking.id, orderId: booking.orderId });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
