import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import logger from "@/lib/logger";
import { verifyJWT } from "@/lib/jwt";


async function verifySuperAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("super_token")?.value;
    if (!token) return false;

    const payload = await verifyJWT(token);
    return payload?.role === "SUPER_ADMIN";
}


export async function GET(
    request: Request,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        if (!await verifySuperAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId } = await params;
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                _count: {
                    select: { events: true, bookings: true, members: true, users: true }
                }
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        logger.error(error, "Error fetching tenant details");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        if (!await verifySuperAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId } = await params;
        const body = await request.json();
        
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: body.name,
                upiId: body.upiId,
                upiName: body.upiName,
                tagline: body.tagline,
                brandColor: body.brandColor,
                logoUrl: body.logoUrl,
                isActive: body.isActive,
                razorpayKeyId: body.razorpayKeyId,
                razorpayWebhookSecret: body.razorpayWebhookSecret,
            }
        });

        return NextResponse.json(updatedTenant);
    } catch (error) {
        logger.error(error, "Error updating tenant");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        if (!await verifySuperAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tenantId } = await params;

        // Note: In a real production system, we might want to soft-delete or Archive.
        // For now, we delete the tenant. Prisma relations will handle cascading if configured or we might need to handle it.
        // Based on the schema, Tenant has many relations. Cascade delete must be set in schema or handled here.
        
        await prisma.tenant.delete({
            where: { id: tenantId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error(error, "Error deleting tenant");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
