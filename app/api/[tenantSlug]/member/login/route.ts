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
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const member = await prisma.member.findFirst({
            where: {
                email: email.trim().toLowerCase(),
                tenantId: tenant.id
            },
        });

        if (!member) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, member.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

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
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        logger.error(error, "Member login error");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

