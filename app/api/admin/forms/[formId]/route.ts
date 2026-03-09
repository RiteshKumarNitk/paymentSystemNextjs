import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ formId: string }> };

export async function PATCH(req: Request, { params }: Params) {
    try {
        const { formId } = await params;
        const body = (await req.json()) as Partial<{
            title: string;
            description: string;
            amount: number;
            isActive: boolean;
        }>;

        const form = await prisma.paymentForm.update({
            where: { id: formId },
            data: {
                ...(body.title !== undefined && { title: body.title.trim() }),
                ...(body.description !== undefined && { description: body.description.trim() }),
                ...(body.amount !== undefined && { amount: Math.round(body.amount) }),
                ...(body.isActive !== undefined && { isActive: body.isActive })
            }
        });
        return NextResponse.json(form);
    } catch {
        return NextResponse.json({ error: "Failed to update form." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { formId } = await params;
        await prisma.paymentForm.delete({ where: { id: formId } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete form." }, { status: 500 });
    }
}
