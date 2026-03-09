import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { password?: string };
        const password = body.password?.trim();

        if (!password) {
            return NextResponse.json({ error: "Password is required." }, { status: 400 });
        }

        const expected = process.env.ADMIN_PASSWORD;
        if (!expected) {
            return NextResponse.json({ error: "Admin password not configured." }, { status: 500 });
        }

        if (password !== expected) {
            return NextResponse.json({ error: "Invalid password." }, { status: 401 });
        }

        const response = NextResponse.json({ success: true });
        response.cookies.set("admin_token", expected, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8 // 8 hours
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Login failed." }, { status: 500 });
    }
}
