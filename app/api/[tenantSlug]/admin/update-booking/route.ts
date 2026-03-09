import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        const { bookingId, status } = await request.json();

        // 1. Verify Admin for this tenant
        const cookieStore = await cookies();
        const adminToken = cookieStore.get(`admin_token_${tenantSlug}`)?.value;
        if (!adminToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Resolve Tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // 3. Update Booking ensuring it belongs to this tenant
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, tenantId: tenant.id },
        });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found in your organization" }, { status: 404 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: { event: true, member: true }
        });

        // 4. Create Notification for Member
        if (updatedBooking.memberId) {
            await prisma.notification.create({
                data: {
                    memberId: updatedBooking.memberId,
                    tenantId: tenant.id,
                    title: status === "confirmed" ? "Booking Confirmed! ✅" : "Booking Update 📝",
                    message: status === "confirmed"
                        ? `Great news! Your spot for ${updatedBooking.event.title} is confirmed. View your digital ticket now.`
                        : `Your booking for ${updatedBooking.event.title} was not verified. Please check the details or contact support.`,
                    type: status === "confirmed" ? "success" : "warning"
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
