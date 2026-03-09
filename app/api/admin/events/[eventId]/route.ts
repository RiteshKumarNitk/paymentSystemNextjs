import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ eventId: string }> };

export async function PATCH(req: Request, { params }: Params) {
    try {
        const { eventId } = await params;
        const body = (await req.json()) as Partial<{
            title: string; description: string; date: string; time: string;
            venue: string; price: number; capacity: number; category: string;
            imageUrl: string; isActive: boolean;
        }>;

        const data: Record<string, unknown> = {};
        if (body.title !== undefined) data.title = body.title.trim();
        if (body.description !== undefined) data.description = body.description.trim();
        if (body.venue !== undefined) data.venue = body.venue.trim();
        if (body.price !== undefined) data.price = Math.max(0, Math.round(Number(body.price)));
        if (body.capacity !== undefined) data.capacity = Math.max(0, Math.round(Number(body.capacity)));
        if (body.category !== undefined) data.category = body.category.trim();
        if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl.trim() || null;
        if (body.isActive !== undefined) data.isActive = body.isActive;
        if (body.date && body.time) data.date = new Date(`${body.date}T${body.time}`);

        const event = await prisma.event.update({ where: { id: eventId }, data });
        return NextResponse.json(event);
    } catch {
        return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { eventId } = await params;
        await prisma.event.delete({ where: { id: eventId } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
    }
}
