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
        const { 
            title, description, startDate, endDate, timezone, 
            venue, venueAddress, venueMapUrl, visibility, 
            category, imageUrl, isActive, ticketTiers 
        } = body;

        // Fallback for legacy fields
        const legacyPrice = ticketTiers?.length > 0 ? ticketTiers[0].price : 0;
        const globalCapacity = ticketTiers?.reduce((acc: number, t: any) => acc + t.capacity, 0) || 0;

        // 3. Create Event scoped to Tenant with nested Ticket Tiers
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(startDate), // maintain legacy date field compatibility
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                timezone,
                venue,
                venueAddress,
                venueMapUrl,
                visibility,
                price: legacyPrice,
                capacity: globalCapacity,
                category,
                imageUrl,
                isActive,
                tenantId: tenant.id,
                ticketTiers: {
                    create: ticketTiers?.map((t: any) => ({
                        name: t.name,
                        price: t.price,
                        capacity: t.capacity
                    })) || []
                }
            },
        });

        return NextResponse.json({ id: event.id });
    } catch (error) {
        console.error("Event creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
