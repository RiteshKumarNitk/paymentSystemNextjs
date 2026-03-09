import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const { bookingId, utr } = await request.json();
        if (!bookingId || !utr) {
            return NextResponse.json({ error: "Booking ID and UTR are required" }, { status: 400 });
        }

        // 2. Validate UTR (12 digits)
        if (!/^\d{12}$/.test(utr)) {
            return NextResponse.json({ error: "UTR must be a 12-digit number" }, { status: 400 });
        }

        // 3. Resolve Tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // 4. Duplicate UTR Check (within this tenant)
        const duplicate = await prisma.booking.findFirst({
            where: { utr, tenantId: tenant.id },
        });
        if (duplicate) {
            return NextResponse.json({ error: "This UTR has already been submitted for this organization" }, { status: 400 });
        }

        // 5. Update Booking
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, tenantId: tenant.id },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                utr,
                status: "pending_verification",
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("UTR Submission error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
