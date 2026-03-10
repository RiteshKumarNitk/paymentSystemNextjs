import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't need auth
const GLOBAL_PUBLIC = ["/", "/api/health"];
const TENANT_PUBLIC_SUFFIXES = ["/", "/login", "/register", "/events"];

export function middleware(request: NextRequest) {
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
        // ALLOW /super/login to be accessed without token
        if (pathname === "/super/login") return NextResponse.next();

        const token = request.cookies.get("super_token")?.value;
        const expected = process.env.ADMIN_PASSWORD || "admin123";
        if (!token || token !== expected) {
            return NextResponse.redirect(new URL("/super/login", request.url));
        }
    }

    // 3. Resolve Tenant Context
    // Path pattern: /[tenant-slug]/...
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return NextResponse.next(); // Home page

    const tenantSlug = segments[0];

    // RESTRICT: Prevent system keywords from being treated as tenants
    const RESERVED_KEYWORDS = ["admin", "super", "api", "member", "events", "forms", "pay"];
    if (RESERVED_KEYWORDS.includes(tenantSlug)) {
        return NextResponse.next();
    }

    // 4. Tenant Admin Protection
    // Path pattern: /[tenant-slug]/admin/...
    if (segments[1] === "admin") {
        const isAdminOpen = segments[2] === "login";
        if (!isAdminOpen) {
            const token = request.cookies.get(`admin_token_${tenantSlug}`)?.value;
            // For now, we compare with a placeholder or if it exists. 
            // In Phase 2, we will use JWT with tenantId.
            if (!token) {
                const url = new URL(`/${tenantSlug}/admin/login`, request.url);
                url.searchParams.set("next", pathname);
                return NextResponse.redirect(url);
            }
        }
    }

    // 5. Member Protection
    // Path pattern: /[tenant-slug]/member/bookings
    if (segments[1] === "member" && segments[2] === "bookings") {
        const token = request.cookies.get(`member_token_${tenantSlug}`)?.value;
        if (!token) {
            const url = new URL(`/${tenantSlug}/member/login`, request.url);
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }
    }

    // Add tenant slug to headers for easy access in Server Components/APIs
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", tenantSlug);
    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
