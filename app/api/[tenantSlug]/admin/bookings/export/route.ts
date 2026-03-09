import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;

        // 1. Verify Admin
        const cookieStore = await cookies();
        const adminToken = cookieStore.get(`admin_token_${tenantSlug}`)?.value;
        if (!adminToken) return new NextResponse("Unauthorized", { status: 401 });

        // 2. Fetch Bookings (Confirmed/Pending)
        const bookings = await prisma.booking.findMany({
            where: {
                event: { tenant: { slug: tenantSlug } },
                status: { not: "cancelled" }
            },
            include: {
                event: { select: { title: true, date: true } },
                member: { select: { name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        // 3. Generate CSV
        const headers = ["Event", "Date", "Member Name", "Email", "Phone", "Amount", "UTR", "Status", "Booked On"];
        const rows = (bookings as any[]).map(b => [
            b.event.title,
            new Date(b.event.date).toLocaleDateString(),
            b.member.name,
            b.member.email,
            b.member.phone,
            b.amount,
            b.utr || "N/A",
            b.status,
            new Date(b.createdAt).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="attendees_${tenantSlug}_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
