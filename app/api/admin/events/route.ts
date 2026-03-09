import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const events = await prisma.event.findMany({
        orderBy: { date: "asc" },
        include: { _count: { select: { bookings: true } } }
    });
    return NextResponse.json(events);
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            title: string;
            description: string;
            date: string;
            time: string;
            venue: string;
            price: number;
            capacity: number;
            category: string;
            imageUrl?: string;
            isActive?: boolean;
        };

        const { title, description, date, time, venue, price, capacity, category, imageUrl, isActive = true } = body;

        if (!title?.trim() || !description?.trim() || !date || !time || !venue?.trim()) {
            return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
        }

        const eventDate = new Date(`${date}T${time}`);
        if (isNaN(eventDate.getTime())) {
            return NextResponse.json({ error: "Invalid date or time." }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                date: eventDate,
                venue: venue.trim(),
                price: Math.max(0, Math.round(Number(price) || 0)),
                capacity: Math.max(0, Math.round(Number(capacity) || 0)),
                category: category?.trim() || "general",
                imageUrl: imageUrl?.trim() || null,
                isActive
            }
        });
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error("Create event failed:", error);
        return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
    }
}
