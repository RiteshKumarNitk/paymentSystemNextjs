import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string; eventId: string }> }
) {
    try {
        const { tenantSlug, eventId } = await params;
        
        // 1. Verify Admin for this tenant
        const cookieStore = await cookies();
        const adminToken = cookieStore.get(`admin_token_${tenantSlug}`)?.value;
        if (!adminToken) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const payload = await verifyJWT(adminToken);
        if (!payload || payload.role !== "TENANT_ADMIN" || payload.tenantSlug !== tenantSlug) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        // 2. Parse payload
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Invalid QR Code payload" }, { status: 400 });
        }

        // 3. Find and validate booking
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                eventId: eventId,
                tenant: { slug: tenantSlug }
            },
            include: { items: { include: { ticketTier: true } } }
        });

        if (!booking) {
            return NextResponse.json({ error: "Ticket not found or doesn't belong to this event" }, { status: 404 });
        }

        if (booking.status !== "confirmed") {
            return NextResponse.json({ 
                error: `Ticket is ${booking.status.toUpperCase()}. Cannot check in.` 
            }, { status: 400 });
        }

        if (booking.checkedInAt) {
            return NextResponse.json({ 
                error: "ALREADY_CHECKED_IN",
                time: booking.checkedInAt 
            }, { status: 400 });
        }

        // 4. Update the Database
        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: { checkedInAt: new Date() }
        });

        // Get ticket details for the success screen
        const ticketNames = booking.items.map((item: any) => `${item.quantity}x ${item.ticketTier.name}`).join(", ");

        return NextResponse.json({ 
            success: true, 
            message: "Ticket Verified", 
            name: booking.name,
            tickets: ticketNames || "General Admission"
        });

    } catch (error) {
        console.error("QR Verification error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
