import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const forms = await prisma.paymentForm.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { payments: true } } }
        });
        return NextResponse.json(forms);
    } catch {
        return NextResponse.json({ error: "Failed to fetch forms." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            title: string;
            description: string;
            amount: number;
            isActive?: boolean;
        };

        const title = body.title?.trim();
        const description = body.description?.trim();
        const amount = Math.round(Number(body.amount ?? 0));
        const isActive = body.isActive !== false;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Title and description are required." },
                { status: 400 }
            );
        }
        if (isNaN(amount) || amount < 0) {
            return NextResponse.json(
                { error: "Amount must be a non-negative number." },
                { status: 400 }
            );
        }

        const form = await prisma.paymentForm.create({
            data: { title, description, amount, isActive }
        });
        return NextResponse.json(form, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create form." }, { status: 500 });
    }
}
