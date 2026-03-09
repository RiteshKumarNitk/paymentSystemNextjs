import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { orderId: string; action: "verify" | "reject" };
        const { orderId, action } = body;

        if (!orderId || !["verify", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({ where: { orderId } });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        const updated = await prisma.booking.update({
            where: { orderId },
            data: { status: action === "verify" ? "confirmed" : "rejected" }
        });

        return NextResponse.json({ success: true, orderId: updated.orderId, status: updated.status });
    } catch (error) {
        console.error("Verify booking failed:", error);
        return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
    }
}
