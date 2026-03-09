import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

type Context = { params: Promise<{ tenantSlug: string, eventId: string }> };

// GET: Fetch single event (Tenant Scoped)
export async function GET(request: Request, { params }: Context) {
    try {
        const { tenantSlug, eventId } = await params;
        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                tenant: { slug: tenantSlug }
            }
        });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH: Update event (Tenant Scoped)
export async function PATCH(request: Request, { params }: Context) {
    try {
        const { tenantSlug, eventId } = await params;

        // 1. Verify Admin
        const cookieStore = await cookies();
        const adminToken = cookieStore.get(`admin_token_${tenantSlug}`)?.value;
        if (!adminToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { title, description, date, venue, price, capacity, category, imageUrl, isActive } = body;

        // 2. Update ensuring it belongs to THIS tenant
        const event = await prisma.event.findFirst({
            where: { id: eventId, tenant: { slug: tenantSlug } }
        });
        if (!event) return NextResponse.json({ error: "Event not found in your organization" }, { status: 404 });

        const updated = await prisma.event.update({
            where: { id: eventId },
            data: { title, description, date, venue, price, capacity, category, imageUrl, isActive },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE: Remove event (Tenant Scoped)
export async function DELETE(request: Request, { params }: Context) {
    try {
        const { tenantSlug, eventId } = await params;

        const cookieStore = await cookies();
        if (!cookieStore.get(`admin_token_${tenantSlug}`)?.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await prisma.event.findFirst({
            where: { id: eventId, tenant: { slug: tenantSlug } }
        });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        await prisma.event.delete({ where: { id: eventId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
