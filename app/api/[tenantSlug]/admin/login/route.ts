import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        const { email, password } = await request.json();

        // 1. Fetch User and verify they belong to THIS tenant
        const user = await prisma.user.findFirst({
            where: {
                email,
                tenant: { slug: tenantSlug }
            },
        });

        if (!user || user.role !== "TENANT_ADMIN") {
            return NextResponse.json({ error: "Invalid credentials for this organization" }, { status: 401 });
        }

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
