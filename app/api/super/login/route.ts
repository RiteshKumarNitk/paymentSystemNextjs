import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

        // Set super_token cookie (Same as ADMIN_PASSWORD for now to match middleware)
        const response = NextResponse.json({ success: true });
        response.cookies.set("super_token", process.env.ADMIN_PASSWORD || "admin123", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
