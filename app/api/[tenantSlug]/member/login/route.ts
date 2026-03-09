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

        // 1. Fetch Tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // 2. Fetch Member within this tenant
        const member = await prisma.member.findFirst({
            where: {
                email,
                tenantId: tenant.id
            },
        });

        if (!member) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Verify Password
        const passwordMatch = await bcrypt.compare(password, member.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 4. Set tenant-scoped member token
        const response = NextResponse.json({ success: true });
        response.cookies.set(`member_token_${tenantSlug}`, member.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
