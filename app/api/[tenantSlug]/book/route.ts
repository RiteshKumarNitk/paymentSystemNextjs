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

        const { eventId, name, phone, email, items } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No tickets selected." }, { status: 400 });
        }

        // 3. Fetch Event within Tenant
        const event = await prisma.event.findFirst({
            where: { id: eventId, tenantId: tenant.id },
            include: {
                ticketTiers: true,
                _count: { select: { bookings: { where: { status: "confirmed" } } } }
            }
        });

        if (!event || !event.isActive) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Calculate total requested tickets
        const totalRequestedTickets = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

        // 4. Check Global Capacity
        if (event.capacity > 0 && (event._count.bookings + totalRequestedTickets) > event.capacity) {
            return NextResponse.json({ error: "Not enough total capacity left for this event." }, { status: 400 });
        }

        // 5. Server-Side Price Verification and Format Mapping
        let serverCalculatedAmount = 0;
        const bookingItemsToCreate = [];

        for (const item of items) {
            const tier = event.ticketTiers.find((t: any) => t.id === item.tierId);
            if (!tier || !tier.isActive) {
                return NextResponse.json({ error: `Ticket tier not found or inactive.` }, { status: 400 });
            }

            // Optional: Tier level capacity check would require summing existing BookingItems.
            // For now, capping by total event is standard unless tiers are strictly capped.

            serverCalculatedAmount += (tier.price * item.quantity);
            
            bookingItemsToCreate.push({
                ticketTierId: tier.id,
                quantity: item.quantity,
                price: tier.price // Snapshot the price
            });
        }

        // 6. Enforce Auth Member
        const member = await getLoggedInMemberBySlug(tenantSlug);
        if (!member) {
            return NextResponse.json({ error: "Unauthorized. You must be logged in to book tickets." }, { status: 401 });
        }

        // 7. Create Booking with transaction
        const orderId = `EP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        
        // This is safe because Prisma nested writes wrap in a transaction automatically
        const booking = await prisma.booking.create({
            data: {
                orderId,
                name,
                phone,
                email,
                amount: serverCalculatedAmount,
                status: serverCalculatedAmount === 0 ? "confirmed" : "pending",
                eventId,
                memberId: member.id,

                tenantId: tenant.id,
                items: {
                    create: bookingItemsToCreate
                }
            },
        });

        return NextResponse.json({ bookingId: booking.id, orderId: booking.orderId });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
