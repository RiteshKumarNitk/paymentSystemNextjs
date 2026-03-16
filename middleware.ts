import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/jwt";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip static assets
    if (
        pathname.includes(".") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth")
    ) {
        return NextResponse.next();
    }

    // 2. Handle Super Admin Protection
    if (pathname.startsWith("/super")) {
        if (pathname === "/super/login") return NextResponse.next();

        const token = request.cookies.get("super_token")?.value;
        if (!token) return NextResponse.redirect(new URL("/super/login", request.url));
        
        const payload = await verifyJWT(token);
        if (!payload || payload.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/super/login", request.url));
        }
    }

    // 3. Resolve Tenant Context
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return NextResponse.next(); // Home page

    const tenantSlug = segments[0];
    const RESERVED_KEYWORDS = ["admin", "super", "api", "member", "events", "forms", "pay", "pricing", "blogs", "about"];
    if (RESERVED_KEYWORDS.includes(tenantSlug)) {
        return NextResponse.next();
    }

    // 4. Tenant Admin Protection
    if (segments[1] === "admin") {
        if (segments[2] === "login") return NextResponse.next();

        const token = request.cookies.get(`admin_token_${tenantSlug}`)?.value;
        if (!token) {
            const url = new URL(`/${tenantSlug}/admin/login`, request.url);
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== "TENANT_ADMIN" || payload.tenantSlug !== tenantSlug) {
            const url = new URL(`/${tenantSlug}/admin/login`, request.url);
            return NextResponse.redirect(url);
        }
    }

    // 5. Member Protection
    if (segments[1] === "member" && segments[2] === "bookings") {
        const token = request.cookies.get(`member_token_${tenantSlug}`)?.value;
        if (!token) {
            const url = new URL(`/${tenantSlug}/member/login`, request.url);
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }

        const payload = await verifyJWT(token);
        if (!payload || payload.tenantSlug !== tenantSlug) {
            const url = new URL(`/${tenantSlug}/member/login`, request.url);
            return NextResponse.redirect(url);
        }
    }

    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", tenantSlug);
    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
