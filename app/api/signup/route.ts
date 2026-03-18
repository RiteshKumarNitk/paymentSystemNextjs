import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import logger from "@/lib/logger";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tenantName, tenantSlug, upiId, upiName, adminEmail, adminPassword } = body;

        // 1. Validate Input
        if (!tenantName || !tenantSlug || !upiId || !upiName || !adminEmail || !adminPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const normalizedSlug = tenantSlug.toLowerCase().trim();
        const normalizedEmail = adminEmail.toLowerCase().trim();

        // 2. Check for existing slug
        const existingTenant = await prisma.tenant.findUnique({ where: { slug: normalizedSlug } });
        if (existingTenant) {
            return NextResponse.json({ error: "Organization URL slug is already in use" }, { status: 400 });
        }

        // 3. Check for existing admin email
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
        }

        // 4. Create Tenant and Admin in a transaction
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const result = await prisma.$transaction(async (tx: any) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName,
                    slug: normalizedSlug,
                    upiId,
                    upiName,
                    isActive: true,
                },
            });

            const user = await tx.user.create({
                data: {
                    email: normalizedEmail,
                    passwordHash: hashedPassword,
                    role: "TENANT_ADMIN",
                    tenantId: tenant.id,
                },
            });

            return { tenant, user };
        });

        // 5. Automatically log the user in
        const token = await signJWT({
            userId: result.user.id,
            email: result.user.email,
            role: "TENANT_ADMIN",
            tenantSlug: result.tenant.slug
        });

        const response = NextResponse.json({ 
            success: true, 
            tenantSlug: result.tenant.slug 
        });

        // Set the same cookie as the tenant admin login route
        response.cookies.set(`admin_token_${result.tenant.slug}`, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        logger.info({ email: result.user.email, tenantSlug: result.tenant.slug }, "New Self-Serve Tenant created and logged in");
        return response;

    } catch (error: any) {
        logger.error(error, "Self-serve signup error");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
