import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/payment";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as {
            name: string;
            phone: string;
            email: string;
            password: string;
        };

        const name = body.name?.trim();
        const phone = normalizePhone(body.phone);
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        const existing = await prisma.member.findFirst({
            where: { OR: [{ email }, { phone }] }
        });
        if (existing) {
            return NextResponse.json(
                { error: "Email or phone already registered." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const member = await prisma.member.create({
            data: { name, phone, email, passwordHash }
        });

        const response = NextResponse.json({ success: true, memberId: member.id });
        response.cookies.set("member_token", member.id, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        return response;
    } catch (error) {
        console.error("Register failed:", error);
        return NextResponse.json({ error: "Registration failed." }, { status: 500 });
    }
}
