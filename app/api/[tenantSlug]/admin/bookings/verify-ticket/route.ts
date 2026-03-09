import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get("bookingId");

        if (!bookingId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Verify Admin Auth
        const cookieStore = await cookies();
        const adminToken = cookieStore.get(`admin_token_${tenantSlug}`)?.value;
        if (!adminToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                tenant: { slug: tenantSlug }
            },
            include: { event: true }
        });

        if (!booking) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

        return NextResponse.json({ booking });
    } catch (err) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
