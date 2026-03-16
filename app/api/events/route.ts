import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
    try {
        const headerList = await headers();
        const tenantSlug = headerList.get("x-tenant-slug");

        if (!tenantSlug) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const events = await prisma.event.findMany({
            where: {
                tenant: { slug: tenantSlug },
                isActive: true
            },
            orderBy: { date: "asc" }
        });

        return NextResponse.json(events);
    } catch (error: any) {
        console.error("Prisma error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const headerList = await headers();
        const tenantSlug = headerList.get("x-tenant-slug");

        if (!tenantSlug) {
            return NextResponse.json({ error: "Tenant context missing" }, { status: 400 });
        }

        const body = await request.json();
        const { title, description, date, venue, price, capacity, category, imageUrl } = body;

        if (!title || !date || !venue) {
            return NextResponse.json({ error: "Missing required fields: title, date, venue" }, { status: 400 });
        }

        // Find tenant by slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        const newEvent = await prisma.event.create({
            data: {
                title,
                description: description || "",
                date: new Date(date),
                venue,
                price: price || 0,
                capacity: capacity || 0,
                category: category || "general",
                imageUrl,
                tenantId: tenant.id
            }
        });

        return NextResponse.json(newEvent, { status: 201 });
    } catch (error: any) {
        console.error("Prisma error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
