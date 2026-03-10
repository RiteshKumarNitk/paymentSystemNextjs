import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

        // 1. Fetch User and verify they belong to THIS tenant
        console.log(`[AUTH] Attempting login for ${email} at tenant ${tenantSlug}`);

        // Find user globally first to see if they even exist
        const globalUser = await (prisma as any).user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!globalUser) {
            console.log(`[AUTH] User ${email} not found in database.`);
            return NextResponse.json({ error: "User profile not found" }, { status: 401 });
        }

        if (globalUser.role !== "TENANT_ADMIN") {
            console.log(`[AUTH] User ${email} is not a Tenant Admin. Role: ${globalUser.role}`);
            return NextResponse.json({ error: "Unauthorized: Individual lacks administrative privileges" }, { status: 403 });
        }

        if (globalUser.tenant?.slug?.toLowerCase() !== tenantSlug.toLowerCase()) {
            console.log(`[AUTH] User ${email} belongs to ${globalUser.tenant?.slug} but tried to access ${tenantSlug}`);
            return NextResponse.json({ error: "Unauthorized: Access denied for this organization hub" }, { status: 403 });
        }

        const user = globalUser;

        // 2. Verify Password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Set tenant-scoped admin token
        // In a production app, this would be a signed JWT containing tenantId
        const response = NextResponse.json({ success: true });
        response.cookies.set(`admin_token_${tenantSlug}`, user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
