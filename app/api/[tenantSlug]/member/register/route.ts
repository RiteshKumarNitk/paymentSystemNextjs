import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tenantSlug: string }> }
) {
    try {
        const { tenantSlug } = await params;
        let { name, phone, email, password } = await request.json();
        
        // Normalize email to prevent case-sensitivity login bugs
        if (email) {
            email = email.trim().toLowerCase();
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (!name || !phone || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const existingMember = await prisma.member.findFirst({
            where: {
                tenantId: tenant.id,
                OR: [{ email }, { phone }],
            },
        });

        if (existingMember) {
            return NextResponse.json({ error: "Email or phone already registered with this organization" }, { status: 400 });
        }

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

        const token = await signJWT({
            userId: member.id,
            email: member.email,
            role: "MEMBER",
            tenantSlug: tenantSlug
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set(`member_token_${tenantSlug}`, token, {
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
