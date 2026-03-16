import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import logger from "@/lib/logger";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const globalUser = await (prisma as any).user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!globalUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 401 });
        }

        if (globalUser.role !== "TENANT_ADMIN") {
            return NextResponse.json({ error: "Unauthorized: Individual lacks administrative privileges" }, { status: 403 });
        }

        if (globalUser.tenant?.slug?.toLowerCase() !== tenantSlug.toLowerCase()) {
            return NextResponse.json({ error: "Unauthorized: Access denied for this organization hub" }, { status: 403 });
        }

        const passwordMatch = await bcrypt.compare(password, globalUser.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = await signJWT({
            userId: globalUser.id,
            email: globalUser.email,
            role: "TENANT_ADMIN",
            tenantSlug: tenantSlug
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set(`admin_token_${tenantSlug}`, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        logger.info({ email: globalUser.email, tenantSlug }, "TenantAdmin logged in");
        return response;
    } catch (error) {
        logger.error(error, "TenantAdmin login error");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

