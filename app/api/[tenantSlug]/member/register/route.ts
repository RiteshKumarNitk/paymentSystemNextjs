import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        const { name, phone, email, password } = await request.json();

        // 1. Fetch Tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (!name || !phone || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // 2. Check for duplicate within the SAME tenant
        const existingMember = await prisma.member.findFirst({
            where: {
                tenantId: tenant.id,
                OR: [{ email }, { phone }],
            },
        });

        if (existingMember) {
            return NextResponse.json({ error: "Email or phone already registered with this organization" }, { status: 400 });
        }

        // 3. Create Member
        const hashedPassword = await bcrypt.hash(password, 10);
        const member = await prisma.member.create({
            data: {
                name,
                phone,
                email,
                passwordHash: hashedPassword,
                tenantId: tenant.id,
            },
        });

        // 4. Auto-login
        const response = NextResponse.json({ success: true });
        response.cookies.set(`member_token_${tenantSlug}`, member.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Member registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
