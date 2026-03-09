import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        const { bookingId } = await request.json();

        if (!bookingId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Verify Admin Auth
        const cookieStore = await cookies();
        const adminToken = cookieStore.get(`admin_token_${tenantSlug}`)?.value;
        if (!adminToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Update with idempotency check
        const booking = await prisma.booking.findFirst({
            where: { id: bookingId, tenant: { slug: tenantSlug } }
        });

        if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (booking.status !== 'confirmed') return NextResponse.json({ error: "Payment not verified" }, { status: 403 });
        if (booking.checkedInAt) return NextResponse.json({ error: "Already checked in" }, { status: 409 });

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: { checkedInAt: new Date() }
        });

        return NextResponse.json({ success: true, checkedInAt: updated.checkedInAt });
    } catch (err) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
