import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        // 1. Verify Super Admin Authorization
        const cookieStore = await cookies();
        const token = cookieStore.get("super_token")?.value;
        if (!token || token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, upiId, upiName, tagline, brandColor, logoUrl, adminEmail, adminPassword } = body;

        // 2. Validate Input
        if (!name || !slug || !upiId || !upiName || !adminEmail || !adminPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // 3. Check for existing slug
        const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
        if (existingTenant) {
            return NextResponse.json({ error: "Slug is already in use" }, { status: 400 });
        }

        // 4. Check for existing admin email
        const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingUser) {
            return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
        }

        // 5. Create Tenant and Admin in a transaction
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const result = await prisma.$transaction(async (tx: any) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    upiId,
                    upiName,
                    tagline,
                    brandColor: brandColor || "#4F46E5",
                    logoUrl,
                },
            });

            const user = await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    role: "TENANT_ADMIN",
                    tenantId: tenant.id,
                },
            });

            return { tenant, user };
        });

        return NextResponse.json({ success: true, tenantId: result.tenant.id });
    } catch (error: any) {
        console.error("Tenant creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
