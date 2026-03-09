import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;

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

        const body = await request.json();
        const { title, description, date, venue, price, capacity, category, imageUrl, isActive } = body;

        // 3. Create Event scoped to Tenant
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date,
                venue,
                price,
                capacity,
                category,
                imageUrl,
                isActive,
                tenantId: tenant.id,
            },
        });

        return NextResponse.json({ id: event.id });
    } catch (error) {
        console.error("Event creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
