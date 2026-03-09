import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { email: string; password: string };
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required." },
                { status: 400 }
            );
        }

        const member = await prisma.member.findUnique({ where: { email } });
        if (!member) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, member.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const response = NextResponse.json({ success: true, name: member.name });
        response.cookies.set("member_token", member.id, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });
        return response;
    } catch (error) {
        console.error("Login failed:", error);
        return NextResponse.json({ error: "Login failed." }, { status: 500 });
    }
}
