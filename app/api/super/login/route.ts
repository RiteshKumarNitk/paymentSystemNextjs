import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import logger from "@/lib/logger";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email?.trim().toLowerCase();
        const password = body.password?.trim();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await (prisma as any).user.findUnique({
            where: { email },
        });

        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = await signJWT({
            userId: user.id,
            email: user.email,
            role: "SUPER_ADMIN",
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set("super_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        logger.info({ email: user.email }, "SuperAdmin logged in");
        return response;
    } catch (error) {
        logger.error(error, "SuperAdmin login error");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

